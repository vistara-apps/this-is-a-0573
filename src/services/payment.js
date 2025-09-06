/**
 * Payment service for SpeakTaskr
 * Handles Turnkey API integration for micro-transactions and premium features
 */

// Configuration
const config = {
  turnkey: {
    apiKey: import.meta.env.VITE_TURNKEY_API_KEY,
    baseURL: import.meta.env.VITE_TURNKEY_BASE_URL || "https://api.turnkey.tech",
  },
  pricing: {
    // Micro-transaction pricing in USD cents
    advancedTaskSequencing: 50, // $0.50
    proactiveReminders: 25, // $0.25
    aiPrioritization: 75, // $0.75
    premiumMonthly: 999, // $9.99/month
  }
};

// Feature definitions
export const PREMIUM_FEATURES = {
  ADVANCED_TASK_SEQUENCING: 'advanced_task_sequencing',
  PROACTIVE_REMINDERS: 'proactive_reminders',
  AI_PRIORITIZATION: 'ai_prioritization',
  UNLIMITED_VOICE_PROCESSING: 'unlimited_voice_processing',
  PREMIUM_MONTHLY: 'premium_monthly'
};

// Mock Turnkey service for development
const mockTurnkeyService = {
  async createPayment(amount, feature, userWallet) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful payment
    return {
      success: true,
      transactionId: `mock_tx_${Date.now()}`,
      amount,
      feature,
      timestamp: new Date().toISOString(),
      walletAddress: userWallet
    };
  },

  async verifyPayment(transactionId) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      verified: true,
      transactionId,
      status: 'confirmed',
      blockHeight: Math.floor(Math.random() * 1000000)
    };
  },

  async getPaymentHistory(userWallet) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        transactionId: 'mock_tx_1234567890',
        feature: PREMIUM_FEATURES.AI_PRIORITIZATION,
        amount: config.pricing.aiPrioritization,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'confirmed'
      },
      {
        transactionId: 'mock_tx_0987654321',
        feature: PREMIUM_FEATURES.PROACTIVE_REMINDERS,
        amount: config.pricing.proactiveReminders,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        status: 'confirmed'
      }
    ];
  }
};

// Real Turnkey service implementation
const turnkeyService = {
  async createPayment(amount, feature, userWallet) {
    if (!config.turnkey.apiKey) {
      throw new Error('Turnkey API key not configured');
    }

    const response = await fetch(`${config.turnkey.baseURL}/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.turnkey.apiKey}`,
      },
      body: JSON.stringify({
        amount,
        currency: 'USD',
        metadata: {
          feature,
          userWallet,
          app: 'speaktaskr'
        },
        walletAddress: userWallet
      })
    });

    if (!response.ok) {
      throw new Error(`Payment creation failed: ${response.statusText}`);
    }

    return await response.json();
  },

  async verifyPayment(transactionId) {
    if (!config.turnkey.apiKey) {
      throw new Error('Turnkey API key not configured');
    }

    const response = await fetch(`${config.turnkey.baseURL}/payments/${transactionId}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.turnkey.apiKey}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Payment verification failed: ${response.statusText}`);
    }

    return await response.json();
  },

  async getPaymentHistory(userWallet) {
    if (!config.turnkey.apiKey) {
      throw new Error('Turnkey API key not configured');
    }

    const response = await fetch(`${config.turnkey.baseURL}/payments/history?wallet=${userWallet}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.turnkey.apiKey}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Payment history fetch failed: ${response.statusText}`);
    }

    return await response.json();
  }
};

// User credits and feature access management
class UserCreditsManager {
  constructor() {
    this.storageKey = 'speaktaskr-user-credits';
  }

  getUserCredits(userWallet) {
    const stored = localStorage.getItem(`${this.storageKey}-${userWallet}`);
    return stored ? JSON.parse(stored) : {
      balance: 0,
      features: {},
      subscriptions: {},
      lastUpdated: new Date().toISOString()
    };
  }

  updateUserCredits(userWallet, updates) {
    const current = this.getUserCredits(userWallet);
    const updated = {
      ...current,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(`${this.storageKey}-${userWallet}`, JSON.stringify(updated));
    return updated;
  }

  hasFeatureAccess(userWallet, feature) {
    const credits = this.getUserCredits(userWallet);
    
    // Check for active subscription
    if (credits.subscriptions[PREMIUM_FEATURES.PREMIUM_MONTHLY]) {
      const subscription = credits.subscriptions[PREMIUM_FEATURES.PREMIUM_MONTHLY];
      if (new Date(subscription.expiresAt) > new Date()) {
        return true;
      }
    }
    
    // Check for individual feature credits
    return credits.features[feature] > 0;
  }

  consumeFeatureCredit(userWallet, feature) {
    const credits = this.getUserCredits(userWallet);
    
    if (credits.features[feature] > 0) {
      credits.features[feature]--;
      this.updateUserCredits(userWallet, credits);
      return true;
    }
    
    return false;
  }

  addFeatureCredits(userWallet, feature, count = 1) {
    const credits = this.getUserCredits(userWallet);
    credits.features[feature] = (credits.features[feature] || 0) + count;
    return this.updateUserCredits(userWallet, credits);
  }
}

const creditsManager = new UserCreditsManager();

// Main payment service
export const paymentService = {
  /**
   * Purchase a premium feature
   */
  async purchaseFeature(feature, userWallet) {
    if (!userWallet) {
      throw new Error('User wallet address required');
    }

    const amount = config.pricing[feature];
    if (!amount) {
      throw new Error(`Unknown feature: ${feature}`);
    }

    try {
      // Use real Turnkey service if configured, otherwise use mock
      const service = config.turnkey.apiKey ? turnkeyService : mockTurnkeyService;
      
      const payment = await service.createPayment(amount, feature, userWallet);
      
      if (payment.success) {
        // Add feature credits to user account
        if (feature === PREMIUM_FEATURES.PREMIUM_MONTHLY) {
          // Add monthly subscription
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);
          
          creditsManager.updateUserCredits(userWallet, {
            subscriptions: {
              [PREMIUM_FEATURES.PREMIUM_MONTHLY]: {
                active: true,
                expiresAt: expiresAt.toISOString(),
                transactionId: payment.transactionId
              }
            }
          });
        } else {
          // Add individual feature credits
          const creditsToAdd = feature === PREMIUM_FEATURES.AI_PRIORITIZATION ? 10 : 5;
          creditsManager.addFeatureCredits(userWallet, feature, creditsToAdd);
        }
        
        return {
          success: true,
          transactionId: payment.transactionId,
          feature,
          amount,
          creditsAdded: feature === PREMIUM_FEATURES.PREMIUM_MONTHLY ? 'subscription' : 
                       feature === PREMIUM_FEATURES.AI_PRIORITIZATION ? 10 : 5
        };
      }
      
      throw new Error('Payment failed');
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  },

  /**
   * Check if user has access to a premium feature
   */
  hasFeatureAccess(userWallet, feature) {
    return creditsManager.hasFeatureAccess(userWallet, feature);
  },

  /**
   * Use a premium feature (consumes credits)
   */
  useFeature(userWallet, feature) {
    if (!this.hasFeatureAccess(userWallet, feature)) {
      throw new Error(`No access to feature: ${feature}`);
    }
    
    // Don't consume credits for subscription features
    const credits = creditsManager.getUserCredits(userWallet);
    if (credits.subscriptions[PREMIUM_FEATURES.PREMIUM_MONTHLY]?.active) {
      return true;
    }
    
    return creditsManager.consumeFeatureCredit(userWallet, feature);
  },

  /**
   * Get user's current credits and subscription status
   */
  getUserStatus(userWallet) {
    if (!userWallet) {
      return {
        hasSubscription: false,
        features: {},
        balance: 0
      };
    }
    
    const credits = creditsManager.getUserCredits(userWallet);
    const hasActiveSubscription = credits.subscriptions[PREMIUM_FEATURES.PREMIUM_MONTHLY]?.active &&
      new Date(credits.subscriptions[PREMIUM_FEATURES.PREMIUM_MONTHLY].expiresAt) > new Date();
    
    return {
      hasSubscription: hasActiveSubscription,
      subscriptionExpires: hasActiveSubscription ? 
        credits.subscriptions[PREMIUM_FEATURES.PREMIUM_MONTHLY].expiresAt : null,
      features: credits.features,
      balance: credits.balance,
      lastUpdated: credits.lastUpdated
    };
  },

  /**
   * Get payment history for user
   */
  async getPaymentHistory(userWallet) {
    if (!userWallet) {
      return [];
    }

    try {
      const service = config.turnkey.apiKey ? turnkeyService : mockTurnkeyService;
      return await service.getPaymentHistory(userWallet);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      return [];
    }
  },

  /**
   * Get pricing information
   */
  getPricing() {
    return {
      features: {
        [PREMIUM_FEATURES.ADVANCED_TASK_SEQUENCING]: {
          price: config.pricing.advancedTaskSequencing,
          credits: 5,
          description: 'AI-powered task sequencing and optimization'
        },
        [PREMIUM_FEATURES.PROACTIVE_REMINDERS]: {
          price: config.pricing.proactiveReminders,
          credits: 5,
          description: 'Smart, context-aware reminder suggestions'
        },
        [PREMIUM_FEATURES.AI_PRIORITIZATION]: {
          price: config.pricing.aiPrioritization,
          credits: 10,
          description: 'Intelligent task prioritization with insights'
        },
        [PREMIUM_FEATURES.PREMIUM_MONTHLY]: {
          price: config.pricing.premiumMonthly,
          credits: 'unlimited',
          description: 'All premium features included'
        }
      },
      currency: 'USD'
    };
  }
};

export default paymentService;

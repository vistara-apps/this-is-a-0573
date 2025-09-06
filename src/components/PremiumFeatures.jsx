import React, { useState } from 'react';
import { Crown, Zap, Brain, Bell, Star, CreditCard, Clock, Loader2 } from 'lucide-react';
import { paymentService, PREMIUM_FEATURES } from '../services/payment';

export function PremiumFeatures({ isPremium, userStatus, onUpgrade, isLoading }) {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const pricing = paymentService.getPricing();

  const features = [
    {
      id: PREMIUM_FEATURES.AI_PRIORITIZATION,
      icon: <Brain className="w-6 h-6" />,
      title: "AI Task Prioritization",
      description: "Intelligent task prioritization with insights",
      price: pricing.features[PREMIUM_FEATURES.AI_PRIORITIZATION]?.price || 75,
      credits: pricing.features[PREMIUM_FEATURES.AI_PRIORITIZATION]?.credits || 10,
      userCredits: userStatus?.features[PREMIUM_FEATURES.AI_PRIORITIZATION] || 0
    },
    {
      id: PREMIUM_FEATURES.PROACTIVE_REMINDERS,
      icon: <Bell className="w-6 h-6" />,
      title: "Proactive Reminders",
      description: "Smart, context-aware reminder suggestions",
      price: pricing.features[PREMIUM_FEATURES.PROACTIVE_REMINDERS]?.price || 25,
      credits: pricing.features[PREMIUM_FEATURES.PROACTIVE_REMINDERS]?.credits || 5,
      userCredits: userStatus?.features[PREMIUM_FEATURES.PROACTIVE_REMINDERS] || 0
    },
    {
      id: PREMIUM_FEATURES.ADVANCED_TASK_SEQUENCING,
      icon: <Star className="w-6 h-6" />,
      title: "Advanced Task Sequencing",
      description: "AI-powered task sequencing and optimization",
      price: pricing.features[PREMIUM_FEATURES.ADVANCED_TASK_SEQUENCING]?.price || 50,
      credits: pricing.features[PREMIUM_FEATURES.ADVANCED_TASK_SEQUENCING]?.credits || 5,
      userCredits: userStatus?.features[PREMIUM_FEATURES.ADVANCED_TASK_SEQUENCING] || 0
    }
  ];

  const handleFeaturePurchase = async (featureId) => {
    setSelectedFeature(featureId);
    try {
      await onUpgrade(featureId);
    } finally {
      setSelectedFeature(null);
    }
  };

  const handleSubscriptionPurchase = async () => {
    setSelectedFeature(PREMIUM_FEATURES.PREMIUM_MONTHLY);
    try {
      await onUpgrade(PREMIUM_FEATURES.PREMIUM_MONTHLY);
    } finally {
      setSelectedFeature(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* User Status */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Crown className={`w-8 h-8 ${isPremium ? 'text-accent' : 'text-yellow-400'}`} />
            <div>
              <h2 className="text-xl font-semibold text-white">
                {isPremium ? 'Premium Active' : 'Free Plan'}
              </h2>
              {userStatus?.hasSubscription && (
                <p className="text-white/70 text-sm">
                  Subscription expires: {new Date(userStatus.subscriptionExpires).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          {!isPremium && (
            <button
              onClick={handleSubscriptionPurchase}
              disabled={isLoading || selectedFeature === PREMIUM_FEATURES.PREMIUM_MONTHLY}
              className="px-4 py-2 bg-gradient-to-r from-accent to-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center space-x-2"
            >
              {selectedFeature === PREMIUM_FEATURES.PREMIUM_MONTHLY ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              <span>Subscribe $9.99/mo</span>
            </button>
          )}
        </div>
        
        {userStatus && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">
                {Object.values(userStatus.features).reduce((sum, count) => sum + count, 0)}
              </div>
              <div className="text-white/70 text-sm">Total Credits</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold text-accent">
                {userStatus.hasSubscription ? '∞' : Object.keys(userStatus.features).length}
              </div>
              <div className="text-white/70 text-sm">Features</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">
                {userStatus.hasSubscription ? 'Unlimited' : 'Pay-per-use'}
              </div>
              <div className="text-white/70 text-sm">Plan Type</div>
            </div>
          </div>
        )}
      </div>

      {/* Premium Features */}
      <div className="grid gap-4">
        {features.map((feature, index) => {
          const hasCredits = feature.userCredits > 0 || userStatus?.hasSubscription;
          const isLoading = selectedFeature === feature.id;
          
          return (
            <div
              key={index}
              className={`glass-card rounded-xl p-4 transition-all duration-200 ${
                hasCredits ? 'border-l-4 border-l-accent' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-2 rounded-lg ${
                    hasCredits ? 'bg-accent/20 text-accent' : 'bg-white/10 text-white/60'
                  }`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-white">
                        {feature.title}
                      </h3>
                      {hasCredits && <span className="text-accent">✓</span>}
                    </div>
                    <p className="text-white/70 text-sm mb-2">{feature.description}</p>
                    
                    {/* Credits display */}
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-white/60">
                        Credits: {userStatus?.hasSubscription ? '∞' : feature.userCredits}
                      </span>
                      <span className="text-white/60">
                        Price: ${(feature.price / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Purchase button */}
                {!userStatus?.hasSubscription && (
                  <button
                    onClick={() => handleFeaturePurchase(feature.id)}
                    disabled={isLoading}
                    className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center space-x-2 text-sm"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    <span>Buy {feature.credits}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* How it works */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-accent" />
          How SpeakTaskr Premium Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-white font-medium mb-2">💳 Micro-transactions</h4>
            <ul className="text-white/70 space-y-1">
              <li>• Pay only for what you use</li>
              <li>• Secure payments via Base wallet</li>
              <li>• Credits never expire</li>
              <li>• No hidden fees</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">🔄 Monthly Subscription</h4>
            <ul className="text-white/70 space-y-1">
              <li>• Unlimited access to all features</li>
              <li>• Best value for heavy users</li>
              <li>• Cancel anytime</li>
              <li>• Priority support</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-accent/10 rounded-lg">
          <p className="text-accent text-sm">
            <Clock className="w-4 h-4 inline mr-1" />
            Demo Mode: All payments are simulated for testing purposes
          </p>
        </div>
      </div>
    </div>
  );
}

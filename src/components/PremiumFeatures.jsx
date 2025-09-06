import React from 'react';
import { Crown, Zap, Brain, Bell, Star } from 'lucide-react';
import { usePaymentContext } from '../hooks/usePaymentContext';

export function PremiumFeatures({ isPremium, onUpgrade }) {
  const { createSession } = usePaymentContext();

  const handleUpgrade = async () => {
    try {
      await createSession();
      onUpgrade();
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Task Prioritization",
      description: "Automatically sort tasks by urgency and importance",
      active: isPremium
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Reminders",
      description: "Context-aware notifications based on your patterns",
      active: isPremium
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Advanced Voice Processing",
      description: "Enhanced speech recognition with better accuracy",
      active: isPremium
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Task Sequencing",
      description: "AI-suggested optimal order for completing tasks",
      active: isPremium
    }
  ];

  return (
    <div className="space-y-6">
      {isPremium ? (
        <div className="glass-card rounded-xl p-6 text-center border-2 border-accent">
          <Crown className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Premium Active</h2>
          <p className="text-white/80">You have access to all premium features!</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-6 text-center">
          <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Upgrade to Premium</h2>
          <p className="text-white/80 mb-6">
            Unlock advanced AI features with micro-transactions on Base
          </p>
          <button
            onClick={handleUpgrade}
            className="px-8 py-3 bg-gradient-to-r from-accent to-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Pay $0.001 to Upgrade
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`glass-card rounded-xl p-4 transition-all duration-200 ${
              feature.active ? 'border-l-4 border-l-accent' : 'opacity-60'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${
                feature.active ? 'bg-accent/20 text-accent' : 'bg-white/10 text-white/60'
              }`}>
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">
                  {feature.title}
                  {feature.active && <span className="ml-2 text-accent">✓</span>}
                </h3>
                <p className="text-white/70 text-sm">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-4">
        <h3 className="text-white font-semibold mb-2">💡 How it works</h3>
        <ul className="text-white/70 text-sm space-y-1">
          <li>• Connect your Base wallet</li>
          <li>• Pay $0.001 for premium features</li>
          <li>• Enjoy enhanced AI capabilities</li>
          <li>• Cancel anytime, no subscriptions</li>
        </ul>
      </div>
    </div>
  );
}
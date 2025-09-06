import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Mic, Brain } from 'lucide-react';

export function Header() {
  return (
    <header className="glass-card border-b border-white/20">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">SpeakTaskr</h1>
            <p className="text-sm text-white/70">Your Voice, Your Tasks</p>
          </div>
        </div>
        
        <ConnectButton />
      </div>
    </header>
  );
}
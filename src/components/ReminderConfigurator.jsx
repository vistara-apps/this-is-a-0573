import React, { useState, useEffect } from 'react';
import { Clock, Bell, BellOff, Plus, X, Zap } from 'lucide-react';
import { apiService } from '../services/api';

export function ReminderConfigurator({ 
  item, 
  onSave, 
  onCancel, 
  isPremium = false,
  userPreferences = {} 
}) {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Initialize reminders from item
  useEffect(() => {
    if (item?.reminder_settings?.reminders) {
      setReminders(item.reminder_settings.reminders);
    } else {
      // Default reminder
      setReminders([{
        id: Date.now(),
        time: '1 hour before',
        offset_minutes: 60,
        type: 'notification',
        enabled: true
      }]);
    }
  }, [item]);

  // Load AI suggestions for premium users
  useEffect(() => {
    if (isPremium && item) {
      loadAISuggestions();
    }
  }, [isPremium, item]);

  const loadAISuggestions = async () => {
    setIsLoading(true);
    try {
      const suggestions = await apiService.generateReminderSuggestions(item, userPreferences);
      setAiSuggestions(suggestions.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to load AI suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addReminder = (suggestion = null) => {
    const newReminder = suggestion ? {
      id: Date.now(),
      time: suggestion.time,
      offset_minutes: suggestion.offset_minutes,
      type: suggestion.type,
      enabled: true,
      reasoning: suggestion.reasoning
    } : {
      id: Date.now(),
      time: '1 hour before',
      offset_minutes: 60,
      type: 'notification',
      enabled: true
    };

    setReminders(prev => [...prev, newReminder]);
    
    if (suggestion) {
      setShowSuggestions(false);
    }
  };

  const updateReminder = (id, updates) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id ? { ...reminder, ...updates } : reminder
    ));
  };

  const removeReminder = (id) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const handleSave = () => {
    const reminderSettings = {
      enabled: reminders.some(r => r.enabled),
      reminders: reminders.filter(r => r.enabled)
    };
    
    onSave(reminderSettings);
  };

  const presetOptions = [
    { label: '15 minutes before', offset: 15 },
    { label: '30 minutes before', offset: 30 },
    { label: '1 hour before', offset: 60 },
    { label: '2 hours before', offset: 120 },
    { label: '1 day before', offset: 1440 },
    { label: '1 week before', offset: 10080 }
  ];

  const reminderTypes = [
    { value: 'notification', label: 'Notification', icon: Bell },
    { value: 'email', label: 'Email', icon: Bell },
    { value: 'sms', label: 'SMS', icon: Bell }
  ];

  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Configure Reminders</h3>
        </div>
        <button
          onClick={onCancel}
          className="p-1 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Item Info */}
      <div className="glass-card rounded-lg p-4">
        <h4 className="font-medium text-white mb-1">
          {item?.title || item?.description || 'Untitled'}
        </h4>
        <p className="text-white/70 text-sm">
          {item?.type === 'event' ? 'Event' : 'Task'} • 
          {item?.due_date || item?.start_time ? 
            new Date(item.due_date || item.start_time).toLocaleString() : 
            'No date set'
          }
        </p>
      </div>

      {/* AI Suggestions (Premium) */}
      {isPremium && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-white font-medium">AI Suggestions</span>
            </div>
            {!showSuggestions && (
              <button
                onClick={loadAISuggestions}
                disabled={isLoading}
                className="px-3 py-1 bg-accent text-white rounded-lg text-sm hover:bg-accent/80 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Get Suggestions'}
              </button>
            )}
          </div>

          {showSuggestions && aiSuggestions.length > 0 && (
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="glass-card rounded-lg p-3 cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() => addReminder(suggestion)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium">{suggestion.time}</span>
                      <span className="text-white/60 ml-2">({suggestion.type})</span>
                    </div>
                    <Plus className="w-4 h-4 text-accent" />
                  </div>
                  {suggestion.reasoning && (
                    <p className="text-white/70 text-xs mt-1">{suggestion.reasoning}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Current Reminders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">Reminders</span>
          <button
            onClick={() => addReminder()}
            className="flex items-center space-x-1 px-3 py-1 bg-primary text-white rounded-lg text-sm hover:bg-primary/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {reminders.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <BellOff className="w-8 h-8 mx-auto mb-2" />
            <p>No reminders set</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="glass-card rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={reminder.enabled}
                      onChange={(e) => updateReminder(reminder.id, { enabled: e.target.checked })}
                      className="w-4 h-4 text-primary bg-transparent border-white/30 rounded focus:ring-primary"
                    />
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <button
                    onClick={() => removeReminder(reminder.id)}
                    className="p-1 text-white/60 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Time Selection */}
                  <div>
                    <label className="block text-white/80 text-sm mb-1">When</label>
                    <select
                      value={reminder.offset_minutes}
                      onChange={(e) => {
                        const offset = parseInt(e.target.value);
                        const option = presetOptions.find(opt => opt.offset === offset);
                        updateReminder(reminder.id, {
                          offset_minutes: offset,
                          time: option?.label || `${offset} minutes before`
                        });
                      }}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {presetOptions.map((option) => (
                        <option key={option.offset} value={option.offset} className="bg-gray-800">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type Selection */}
                  <div>
                    <label className="block text-white/80 text-sm mb-1">Type</label>
                    <select
                      value={reminder.type}
                      onChange={(e) => updateReminder(reminder.id, { type: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {reminderTypes.map((type) => (
                        <option key={type.value} value={type.value} className="bg-gray-800">
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {reminder.reasoning && (
                  <div className="mt-2 p-2 bg-accent/20 rounded-lg">
                    <p className="text-white/80 text-xs">
                      <Zap className="w-3 h-3 inline mr-1" />
                      {reminder.reasoning}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-3 pt-4 border-t border-white/20">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors font-medium"
        >
          Save Reminders
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

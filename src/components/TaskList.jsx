import React, { useState, useEffect } from 'react';
import { Check, Clock, AlertTriangle, Trash2, Star, Bell, Zap, Settings } from 'lucide-react';
import { ReminderConfigurator } from './ReminderConfigurator';
import { useOpenAI } from '../hooks/useOpenAI';
import { paymentService, PREMIUM_FEATURES } from '../services/payment';

const priorityIcons = {
  high: <AlertTriangle className="w-4 h-4 text-red-500" />,
  medium: <Clock className="w-4 h-4 text-yellow-500" />,
  low: <Star className="w-4 h-4 text-green-500" />
};

const priorityColors = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500', 
  low: 'border-l-green-500'
};

export function TaskList({ tasks, onStatusChange, onDelete, onUpdate, isPremium, userWallet }) {
  const [sortedTasks, setSortedTasks] = useState(tasks);
  const [aiInsights, setAiInsights] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showReminderConfig, setShowReminderConfig] = useState(null);
  const { generateTaskSuggestions } = useOpenAI();

  // Update sorted tasks when tasks change
  useEffect(() => {
    setSortedTasks(tasks);
  }, [tasks]);

  const handleAIPrioritization = async () => {
    if (!isPremium || !userWallet) {
      return;
    }

    // Check if user has access to AI prioritization
    if (!paymentService.hasFeatureAccess(userWallet, PREMIUM_FEATURES.AI_PRIORITIZATION)) {
      alert('You need to purchase AI Prioritization credits to use this feature.');
      return;
    }

    setIsOptimizing(true);
    try {
      // Use the premium feature
      paymentService.useFeature(userWallet, PREMIUM_FEATURES.AI_PRIORITIZATION);
      
      const result = await generateTaskSuggestions(tasks);
      
      if (result.prioritized_tasks) {
        // Reorder tasks based on AI suggestions
        const reorderedTasks = result.prioritized_tasks.map(suggestion => {
          const task = tasks.find(t => t.id === suggestion.id);
          return {
            ...task,
            ai_priority: suggestion.suggested_priority,
            ai_reasoning: suggestion.reasoning,
            ai_order: suggestion.suggested_order
          };
        });
        
        setSortedTasks(reorderedTasks);
        setAiInsights(result.insights);
      }
    } catch (error) {
      console.error('AI prioritization failed:', error);
      alert('Failed to optimize tasks. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-white/60" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No tasks yet</h3>
        <p className="text-white/70">Use the voice input to create your first task!</p>
      </div>
    );
  }

  const handleReminderSave = (taskId, reminderSettings) => {
    if (onUpdate) {
      onUpdate(taskId, { reminder_settings: reminderSettings });
    }
    setShowReminderConfig(null);
  };

  return (
    <div className="space-y-4">
      {/* AI Controls */}
      {isPremium && (
        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-accent" />
              <h3 className="text-white font-semibold">AI Task Optimization</h3>
            </div>
            <button
              onClick={handleAIPrioritization}
              disabled={isOptimizing || tasks.length === 0}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isOptimizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Optimize Tasks</span>
                </>
              )}
            </button>
          </div>
          
          {aiInsights && (
            <div className="mt-3 p-3 bg-accent/20 rounded-lg">
              <p className="text-white/90 text-sm">
                <Zap className="w-4 h-4 inline mr-1" />
                {aiInsights}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Task List */}
      {sortedTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onConfigureReminder={() => setShowReminderConfig(task)}
          isPremium={isPremium}
        />
      ))}

      {/* Reminder Configurator Modal */}
      {showReminderConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <ReminderConfigurator
              item={showReminderConfig}
              onSave={(reminderSettings) => handleReminderSave(showReminderConfig.id, reminderSettings)}
              onCancel={() => setShowReminderConfig(null)}
              isPremium={isPremium}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TaskItem({ task, onStatusChange, onDelete, onConfigureReminder, isPremium }) {
  const isCompleted = task.status === 'completed';
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;
  const hasReminders = task.reminder_settings?.enabled && task.reminder_settings?.reminders?.length > 0;

  return (
    <div className={`glass-card rounded-xl p-4 border-l-4 ${priorityColors[task.priority]} transition-all duration-200 hover:bg-white/20`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <button
              onClick={() => onStatusChange(task.id, isCompleted ? 'pending' : 'completed')}
              className={`w-5 h-5 rounded-full border-2 transition-colors ${
                isCompleted 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-white/50 hover:border-white'
              }`}
            >
              {isCompleted && <Check className="w-3 h-3 text-white mx-auto" />}
            </button>
            
            <span className={`flex-1 ${isCompleted ? 'line-through text-white/60' : 'text-white'}`}>
              {task.description}
            </span>
            
            <div className="flex items-center space-x-2">
              {priorityIcons[task.priority]}
              
              {/* Reminder indicator */}
              {hasReminders && (
                <Bell className="w-4 h-4 text-accent" title="Reminders set" />
              )}
              
              {/* Configure reminder button */}
              <button
                onClick={onConfigureReminder}
                className="p-1 hover:bg-accent/20 rounded transition-colors"
                title="Configure reminders"
              >
                <Settings className="w-4 h-4 text-white/60 hover:text-accent" />
              </button>
              
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 hover:bg-red-500/20 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
          
          {/* Task metadata */}
          <div className="space-y-1">
            {task.due_date && (
              <div className={`text-sm ${isOverdue ? 'text-red-300' : 'text-white/60'}`}>
                📅 Due: {new Date(task.due_date).toLocaleDateString()} 
                {isOverdue && ' (Overdue!)'}
              </div>
            )}
            
            {/* AI insights */}
            {task.ai_reasoning && (
              <div className="text-xs text-accent/80 bg-accent/10 rounded px-2 py-1">
                <Zap className="w-3 h-3 inline mr-1" />
                AI: {task.ai_reasoning}
              </div>
            )}
            
            {/* Reminder summary */}
            {hasReminders && (
              <div className="text-xs text-white/60">
                🔔 {task.reminder_settings.reminders.length} reminder{task.reminder_settings.reminders.length > 1 ? 's' : ''} set
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

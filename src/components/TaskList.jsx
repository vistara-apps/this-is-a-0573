import React from 'react';
import { Check, Clock, AlertTriangle, Trash2, Star } from 'lucide-react';

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

export function TaskList({ tasks, onStatusChange, onDelete, isPremium }) {
  const sortedTasks = isPremium 
    ? [...tasks].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
    : tasks;

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

  return (
    <div className="space-y-4">
      {isPremium && (
        <div className="glass-card rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">🔮 AI Prioritization Active</h3>
          <p className="text-white/70 text-sm">Tasks automatically sorted by priority and urgency.</p>
        </div>
      )}
      
      {sortedTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function TaskItem({ task, onStatusChange, onDelete }) {
  const isCompleted = task.status === 'completed';
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

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
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 hover:bg-red-500/20 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
          
          {task.due_date && (
            <div className={`text-sm ${isOverdue ? 'text-red-300' : 'text-white/60'}`}>
              📅 Due: {new Date(task.due_date).toLocaleDateString()} 
              {isOverdue && ' (Overdue!)'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
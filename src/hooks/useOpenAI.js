import { useState } from 'react';
import { apiService } from '../services/api';

export function useOpenAI() {
  const [isLoading, setIsLoading] = useState(false);

  const transcribeAndParse = async (audioBlob) => {
    setIsLoading(true);
    try {
      const result = await apiService.transcribeAndParse(audioBlob);
      return result;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to process audio');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTaskSuggestions = async (tasks) => {
    setIsLoading(true);
    try {
      const result = await apiService.prioritizeTasks(tasks);
      return result;
    } catch (error) {
      console.error('Task prioritization error:', error);
      // Fallback to simple sorting
      return tasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const dueDateA = a.due_date ? new Date(a.due_date) : new Date('2099-12-31');
        const dueDateB = b.due_date ? new Date(b.due_date) : new Date('2099-12-31');
        
        // Sort by priority first, then by due date
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return dueDateA - dueDateB;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReminderSuggestions = async (item, userPreferences = {}) => {
    setIsLoading(true);
    try {
      const result = await apiService.generateReminderSuggestions(item, userPreferences);
      return result;
    } catch (error) {
      console.error('Reminder suggestions error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    transcribeAndParse,
    generateTaskSuggestions,
    generateReminderSuggestions,
    isLoading
  };
}

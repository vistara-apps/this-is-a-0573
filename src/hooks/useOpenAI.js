import { useState } from 'react';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

export function useOpenAI() {
  const [isLoading, setIsLoading] = useState(false);

  const transcribeAndParse = async (audioBlob) => {
    setIsLoading(true);
    try {
      // For demo purposes, we'll simulate the transcription and parsing
      // In a real app, you would send the audio to OpenAI's transcription API
      
      // Simulate transcription delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock responses based on common voice inputs
      const mockResponses = [
        {
          type: 'task',
          data: {
            description: 'Call mom about dinner plans',
            due_date: new Date(Date.now() + 86400000).toISOString(),
            priority: 'high'
          }
        },
        {
          type: 'task',
          data: {
            description: 'Buy groceries for the week',
            due_date: new Date(Date.now() + 172800000).toISOString(),
            priority: 'medium'
          }
        },
        {
          type: 'event',
          data: {
            title: 'Doctor appointment',
            start_time: new Date(Date.now() + 259200000).toISOString(),
            end_time: new Date(Date.now() + 262800000).toISOString(),
            location: 'Medical Center'
          }
        },
        {
          type: 'task',
          data: {
            description: 'Finish project presentation',
            due_date: new Date(Date.now() + 432000000).toISOString(),
            priority: 'high'
          }
        }
      ];

      // Return a random mock response
      return mockResponses[Math.floor(Math.random() * mockResponses.length)];

    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to process audio');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTaskSuggestions = async (tasks) => {
    // Mock AI prioritization
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
  };

  return {
    transcribeAndParse,
    generateTaskSuggestions,
    isLoading
  };
}
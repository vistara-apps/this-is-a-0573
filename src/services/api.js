/**
 * Centralized API service layer for SpeakTaskr
 * Handles all external API integrations with proper error handling and retry logic
 */

import OpenAI from 'openai';

// Configuration
const config = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    baseURL: import.meta.env.VITE_OPENAI_BASE_URL || "https://api.openai.com/v1",
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  turnkey: {
    apiKey: import.meta.env.VITE_TURNKEY_API_KEY,
    baseURL: import.meta.env.VITE_TURNKEY_BASE_URL || "https://api.turnkey.tech",
  }
};

// Initialize OpenAI client
const openai = config.openai.apiKey ? new OpenAI({
  apiKey: config.openai.apiKey,
  baseURL: config.openai.baseURL,
  dangerouslyAllowBrowser: true,
}) : null;

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delayTime = baseDelay * Math.pow(2, i);
      console.warn(`Attempt ${i + 1} failed, retrying in ${delayTime}ms:`, error.message);
      await delay(delayTime);
    }
  }
};

// OpenAI Service
export const openaiService = {
  /**
   * Transcribe audio to text using OpenAI Whisper
   */
  async transcribeAudio(audioBlob) {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    return retryWithBackoff(async () => {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await openai.audio.transcriptions.create({
        file: audioBlob,
        model: 'whisper-1',
        language: 'en',
        response_format: 'text'
      });

      return response;
    });
  },

  /**
   * Parse natural language text into structured task or event data
   */
  async parseTaskOrEvent(text) {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an AI assistant that parses natural language into structured task or event data. 

Analyze the user's input and determine if it's a TASK or an EVENT, then extract relevant information.

For TASKS, extract:
- description (string): Clear, actionable description
- due_date (ISO string): When it should be completed (if mentioned)
- priority (string): "high", "medium", or "low" based on urgency indicators
- reminder_settings (object): When to remind the user

For EVENTS, extract:
- title (string): Event name
- start_time (ISO string): When it starts
- end_time (ISO string): When it ends (estimate if not specified)
- location (string): Where it takes place (if mentioned)
- attendees (array): Who should attend (if mentioned)
- reminder_settings (object): When to remind the user

Respond with JSON in this format:
{
  "type": "task" | "event",
  "confidence": 0.0-1.0,
  "data": { ... extracted data ... }
}

Current date/time: ${new Date().toISOString()}`;

    return retryWithBackoff(async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    });
  },

  /**
   * Generate intelligent task prioritization suggestions
   */
  async prioritizeTasks(tasks) {
    if (!openai || tasks.length === 0) {
      return tasks;
    }

    const systemPrompt = `You are an AI productivity assistant. Analyze the given tasks and provide intelligent prioritization suggestions.

Consider:
- Due dates and urgency
- Task complexity and estimated time
- Dependencies between tasks
- Impact and importance
- User patterns (if available)

Return the tasks in prioritized order with reasoning.

Respond with JSON:
{
  "prioritized_tasks": [
    {
      "id": "task_id",
      "suggested_priority": "high|medium|low",
      "reasoning": "Brief explanation",
      "suggested_order": 1
    }
  ],
  "insights": "Overall productivity insights"
}`;

    return retryWithBackoff(async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(tasks) }
        ],
        temperature: 0.2,
        max_tokens: 1000
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    });
  },

  /**
   * Generate context-aware reminder suggestions
   */
  async generateReminderSuggestions(item, userPreferences = {}) {
    if (!openai) {
      return {
        suggestions: [
          { time: '1 hour before', type: 'notification' },
          { time: '1 day before', type: 'notification' }
        ]
      };
    }

    const systemPrompt = `You are an AI assistant that suggests optimal reminder times for tasks and events.

Consider:
- Item type, urgency, and complexity
- User preferences and patterns
- Best practices for productivity
- Time of day and scheduling context

Respond with JSON:
{
  "suggestions": [
    {
      "time": "human readable time (e.g., '2 hours before', 'morning of')",
      "offset_minutes": number (minutes before the due date/start time),
      "type": "notification|email|sms",
      "reasoning": "Why this reminder time is optimal"
    }
  ]
}`;

    return retryWithBackoff(async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify({ item, userPreferences }) }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    });
  }
};

// Mock services for development/fallback
export const mockService = {
  async transcribeAudio(audioBlob) {
    await delay(1500); // Simulate API delay
    return "Remind me to buy groceries tomorrow at 5 PM";
  },

  async parseTaskOrEvent(text) {
    await delay(800);
    
    // Simple keyword-based parsing for demo
    const isEvent = /schedule|meeting|appointment|event/i.test(text);
    const isHighPriority = /urgent|important|asap|critical/i.test(text);
    
    if (isEvent) {
      return {
        type: 'event',
        confidence: 0.8,
        data: {
          title: text.replace(/schedule|meeting|appointment/gi, '').trim() || 'New Event',
          start_time: new Date(Date.now() + 86400000).toISOString(),
          end_time: new Date(Date.now() + 90000000).toISOString(),
          location: 'TBD',
          reminder_settings: {
            enabled: true,
            time_before: 3600000 // 1 hour
          }
        }
      };
    } else {
      return {
        type: 'task',
        confidence: 0.9,
        data: {
          description: text,
          due_date: new Date(Date.now() + 86400000).toISOString(),
          priority: isHighPriority ? 'high' : 'medium',
          reminder_settings: {
            enabled: true,
            time_before: 3600000 // 1 hour
          }
        }
      };
    }
  },

  async prioritizeTasks(tasks) {
    await delay(1000);
    
    // Simple priority-based sorting
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const sorted = [...tasks].sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      const dueDateA = a.due_date ? new Date(a.due_date) : new Date('2099-12-31');
      const dueDateB = b.due_date ? new Date(b.due_date) : new Date('2099-12-31');
      return dueDateA - dueDateB;
    });

    return {
      prioritized_tasks: sorted.map((task, index) => ({
        id: task.id,
        suggested_priority: task.priority,
        reasoning: `Priority: ${task.priority}, Due: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}`,
        suggested_order: index + 1
      })),
      insights: `You have ${tasks.filter(t => t.priority === 'high').length} high-priority tasks. Consider tackling those first.`
    };
  },

  async generateReminderSuggestions(item) {
    await delay(500);
    
    const isUrgent = item.priority === 'high';
    const suggestions = [
      {
        time: isUrgent ? '30 minutes before' : '1 hour before',
        offset_minutes: isUrgent ? 30 : 60,
        type: 'notification',
        reasoning: isUrgent ? 'High priority item needs immediate attention' : 'Standard reminder timing'
      },
      {
        time: '1 day before',
        offset_minutes: 1440,
        type: 'notification',
        reasoning: 'Advance notice for planning'
      }
    ];

    return { suggestions };
  }
};

// Main API service that chooses between real and mock implementations
export const apiService = {
  async transcribeAndParse(audioBlob) {
    try {
      // Try real OpenAI service first
      if (config.openai.apiKey) {
        const transcription = await openaiService.transcribeAudio(audioBlob);
        const parsed = await openaiService.parseTaskOrEvent(transcription);
        return parsed;
      } else {
        // Fall back to mock service
        console.warn('OpenAI API key not configured, using mock service');
        const transcription = await mockService.transcribeAudio(audioBlob);
        const parsed = await mockService.parseTaskOrEvent(transcription);
        return parsed;
      }
    } catch (error) {
      console.error('Error in transcribeAndParse:', error);
      // Fall back to mock service on error
      const transcription = await mockService.transcribeAudio(audioBlob);
      const parsed = await mockService.parseTaskOrEvent(transcription);
      return parsed;
    }
  },

  async prioritizeTasks(tasks) {
    try {
      if (config.openai.apiKey) {
        return await openaiService.prioritizeTasks(tasks);
      } else {
        return await mockService.prioritizeTasks(tasks);
      }
    } catch (error) {
      console.error('Error in prioritizeTasks:', error);
      return await mockService.prioritizeTasks(tasks);
    }
  },

  async generateReminderSuggestions(item, userPreferences) {
    try {
      if (config.openai.apiKey) {
        return await openaiService.generateReminderSuggestions(item, userPreferences);
      } else {
        return await mockService.generateReminderSuggestions(item);
      }
    } catch (error) {
      console.error('Error in generateReminderSuggestions:', error);
      return await mockService.generateReminderSuggestions(item);
    }
  }
};

export default apiService;

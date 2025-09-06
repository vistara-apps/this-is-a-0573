/**
 * Supabase service for SpeakTaskr
 * Handles database operations for tasks, events, and user data
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Database schema types (for reference)
export const TABLES = {
  USERS: 'users',
  TASKS: 'tasks',
  CALENDAR_EVENTS: 'calendar_events',
  USER_PREFERENCES: 'user_preferences'
};

// Error handling utility
const handleSupabaseError = (error, operation) => {
  console.error(`Supabase ${operation} error:`, error);
  throw new Error(`Database ${operation} failed: ${error.message}`);
};

// User service
export const userService = {
  /**
   * Get or create user profile
   */
  async getOrCreateUser(userData) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('farcaster_id', userData.farcaster_id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        handleSupabaseError(fetchError, 'user fetch');
      }

      if (existingUser) {
        return existingUser;
      }

      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from(TABLES.USERS)
        .insert([{
          farcaster_id: userData.farcaster_id,
          wallet_address: userData.wallet_address,
          preferences: userData.preferences || {},
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        handleSupabaseError(createError, 'user creation');
      }

      return newUser;
    } catch (error) {
      handleSupabaseError(error, 'user operation');
    }
  },

  /**
   * Update user preferences
   */
  async updatePreferences(userId, preferences) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({ preferences })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'preferences update');
      }

      return data;
    } catch (error) {
      handleSupabaseError(error, 'preferences update');
    }
  }
};

// Task service
export const taskService = {
  /**
   * Get all tasks for a user
   */
  async getTasks(userId) {
    if (!supabase) {
      return []; // Return empty array if Supabase not configured
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'tasks fetch');
      }

      return data || [];
    } catch (error) {
      console.warn('Failed to fetch tasks from database, using local storage');
      return [];
    }
  },

  /**
   * Create a new task
   */
  async createTask(userId, taskData) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .insert([{
          user_id: userId,
          description: taskData.description,
          status: taskData.status || 'pending',
          due_date: taskData.due_date,
          priority: taskData.priority || 'medium',
          reminder_settings: taskData.reminder_settings || {},
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'task creation');
      }

      return data;
    } catch (error) {
      handleSupabaseError(error, 'task creation');
    }
  },

  /**
   * Update a task
   */
  async updateTask(taskId, updates) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .update(updates)
        .eq('task_id', taskId)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'task update');
      }

      return data;
    } catch (error) {
      handleSupabaseError(error, 'task update');
    }
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      const { error } = await supabase
        .from(TABLES.TASKS)
        .delete()
        .eq('task_id', taskId);

      if (error) {
        handleSupabaseError(error, 'task deletion');
      }

      return true;
    } catch (error) {
      handleSupabaseError(error, 'task deletion');
    }
  },

  /**
   * Subscribe to task changes
   */
  subscribeToTasks(userId, callback) {
    if (!supabase) {
      return null;
    }

    return supabase
      .channel('tasks')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: TABLES.TASKS,
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  }
};

// Calendar event service
export const eventService = {
  /**
   * Get all events for a user
   */
  async getEvents(userId) {
    if (!supabase) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.CALENDAR_EVENTS)
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true });

      if (error) {
        handleSupabaseError(error, 'events fetch');
      }

      return data || [];
    } catch (error) {
      console.warn('Failed to fetch events from database, using local storage');
      return [];
    }
  },

  /**
   * Create a new event
   */
  async createEvent(userId, eventData) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.CALENDAR_EVENTS)
        .insert([{
          user_id: userId,
          title: eventData.title,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          location: eventData.location,
          attendees: eventData.attendees || [],
          reminder_settings: eventData.reminder_settings || {},
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'event creation');
      }

      return data;
    } catch (error) {
      handleSupabaseError(error, 'event creation');
    }
  },

  /**
   * Update an event
   */
  async updateEvent(eventId, updates) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.CALENDAR_EVENTS)
        .update(updates)
        .eq('event_id', eventId)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'event update');
      }

      return data;
    } catch (error) {
      handleSupabaseError(error, 'event update');
    }
  },

  /**
   * Delete an event
   */
  async deleteEvent(eventId) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      const { error } = await supabase
        .from(TABLES.CALENDAR_EVENTS)
        .delete()
        .eq('event_id', eventId);

      if (error) {
        handleSupabaseError(error, 'event deletion');
      }

      return true;
    } catch (error) {
      handleSupabaseError(error, 'event deletion');
    }
  },

  /**
   * Subscribe to event changes
   */
  subscribeToEvents(userId, callback) {
    if (!supabase) {
      return null;
    }

    return supabase
      .channel('events')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: TABLES.CALENDAR_EVENTS,
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  }
};

// Data migration utilities
export const migrationService = {
  /**
   * Migrate local storage data to Supabase
   */
  async migrateLocalData(userId) {
    if (!supabase) {
      console.warn('Cannot migrate data: Supabase not configured');
      return;
    }

    try {
      // Migrate tasks
      const localTasks = JSON.parse(localStorage.getItem('speaktaskr-tasks') || '[]');
      if (localTasks.length > 0) {
        console.log(`Migrating ${localTasks.length} tasks to database...`);
        
        for (const task of localTasks) {
          await taskService.createTask(userId, {
            description: task.description,
            status: task.status,
            due_date: task.due_date,
            priority: task.priority,
            reminder_settings: task.reminder_settings
          });
        }
        
        // Clear local storage after successful migration
        localStorage.removeItem('speaktaskr-tasks');
      }

      // Migrate events
      const localEvents = JSON.parse(localStorage.getItem('speaktaskr-events') || '[]');
      if (localEvents.length > 0) {
        console.log(`Migrating ${localEvents.length} events to database...`);
        
        for (const event of localEvents) {
          await eventService.createEvent(userId, {
            title: event.title,
            start_time: event.start_time,
            end_time: event.end_time,
            location: event.location,
            attendees: event.attendees,
            reminder_settings: event.reminder_settings
          });
        }
        
        // Clear local storage after successful migration
        localStorage.removeItem('speaktaskr-events');
      }

      console.log('Data migration completed successfully');
    } catch (error) {
      console.error('Data migration failed:', error);
      // Don't clear local storage if migration failed
    }
  }
};

// Export the main supabase client for direct use if needed
export { supabase };

// Export a combined service object
export const databaseService = {
  user: userService,
  task: taskService,
  event: eventService,
  migration: migrationService,
  isConfigured: () => !!supabase
};

export default databaseService;

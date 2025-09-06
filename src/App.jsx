import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VoiceInput } from './components/VoiceInput';
import { TaskList } from './components/TaskList';
import { CalendarView } from './components/CalendarView';
import { PremiumFeatures } from './components/PremiumFeatures';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/Tabs';
import { databaseService } from './services/supabase';
import { paymentService } from './services/payment';

function App() {
  const [tasks, setTasks] = useLocalStorage('speaktaskr-tasks', []);
  const [events, setEvents] = useLocalStorage('speaktaskr-events', []);
  const [activeTab, setActiveTab] = useState('tasks');
  const [isPremium, setIsPremium] = useState(false);
  const [userWallet, setUserWallet] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize user status and check for premium features
  useEffect(() => {
    // Mock wallet for demo - in real app this would come from wallet connection
    const mockWallet = '0x1234567890abcdef1234567890abcdef12345678';
    setUserWallet(mockWallet);
    
    // Check user's premium status
    const status = paymentService.getUserStatus(mockWallet);
    setUserStatus(status);
    setIsPremium(status.hasSubscription || Object.values(status.features).some(count => count > 0));
  }, []);

  // Migrate local data to database if Supabase is configured
  useEffect(() => {
    if (userWallet && databaseService.isConfigured()) {
      databaseService.migration.migrateLocalData(userWallet);
    }
  }, [userWallet]);

  const addTask = (task) => {
    const newTask = {
      id: Date.now(),
      ...task,
      status: 'pending',
      created_at: new Date().toISOString(),
      priority: task.priority || 'medium'
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const addEvent = (event) => {
    const newEvent = {
      id: Date.now(),
      ...event,
      created_at: new Date().toISOString()
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const updateTaskStatus = (taskId, status) => {
    updateTask(taskId, { status });
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const deleteEvent = (eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const handlePremiumUpgrade = async (feature) => {
    if (!userWallet) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await paymentService.purchaseFeature(feature, userWallet);
      
      if (result.success) {
        // Update user status
        const newStatus = paymentService.getUserStatus(userWallet);
        setUserStatus(newStatus);
        setIsPremium(newStatus.hasSubscription || Object.values(newStatus.features).some(count => count > 0));
        
        alert(`Successfully purchased ${feature}! You now have ${result.creditsAdded} credits.`);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <Header />
        
        <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Voice Input Section */}
          <div className="glass-card rounded-xl p-6 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Speak Your Tasks
            </h2>
            <p className="text-white/80 mb-6">
              Use your voice to create tasks and schedule events instantly
            </p>
            <VoiceInput 
              onTaskCreated={addTask}
              onEventCreated={addEvent}
              isPremium={isPremium}
            />
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-card">
              <TabsTrigger value="tasks" className="text-white">Tasks</TabsTrigger>
              <TabsTrigger value="calendar" className="text-white">Calendar</TabsTrigger>
              <TabsTrigger value="premium" className="text-white">Premium</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks" className="mt-6">
              <TaskList 
                tasks={tasks}
                onStatusChange={updateTaskStatus}
                onUpdate={updateTask}
                onDelete={deleteTask}
                isPremium={isPremium}
                userWallet={userWallet}
              />
            </TabsContent>
            
            <TabsContent value="calendar" className="mt-6">
              <CalendarView 
                events={events}
                onDelete={deleteEvent}
              />
            </TabsContent>
            
            <TabsContent value="premium" className="mt-6">
              <PremiumFeatures 
                isPremium={isPremium}
                userStatus={userStatus}
                onUpgrade={handlePremiumUpgrade}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

export default App;

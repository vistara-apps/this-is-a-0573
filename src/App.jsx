import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VoiceInput } from './components/VoiceInput';
import { TaskList } from './components/TaskList';
import { CalendarView } from './components/CalendarView';
import { PremiumFeatures } from './components/PremiumFeatures';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/Tabs';

function App() {
  const [tasks, setTasks] = useLocalStorage('speaktaskr-tasks', []);
  const [events, setEvents] = useLocalStorage('speaktaskr-events', []);
  const [activeTab, setActiveTab] = useState('tasks');
  const [isPremium, setIsPremium] = useState(false);

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

  const updateTaskStatus = (taskId, status) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const deleteEvent = (eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
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
                onDelete={deleteTask}
                isPremium={isPremium}
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
                onUpgrade={() => setIsPremium(true)}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

export default App;
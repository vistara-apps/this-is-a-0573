import React, { useState, createContext, useContext } from 'react';

const TabsContext = createContext();

export function Tabs({ children, value, onValueChange, className = '' }) {
  const [activeTab, setActiveTab] = useState(value);

  const handleValueChange = (newValue) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }) {
  return (
    <div className={`flex space-x-1 p-1 rounded-lg ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ children, value, className = '' }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`
        flex-1 px-4 py-2 rounded-md transition-all duration-200 font-medium
        ${isActive 
          ? 'bg-white/20 text-white shadow-sm' 
          : 'text-white/70 hover:text-white hover:bg-white/10'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, className = '' }) {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== value) {
    return null;
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
}
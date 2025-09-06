import React from 'react';
import { Calendar, MapPin, Clock, Trash2 } from 'lucide-react';

export function CalendarView({ events, onDelete }) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.start_time) - new Date(b.start_time)
  );

  if (events.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-white/60" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No events scheduled</h3>
        <p className="text-white/70">Use voice input to schedule your first event!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedEvents.map((event) => (
        <EventItem
          key={event.id}
          event={event}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function EventItem({ event, onDelete }) {
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const isToday = startDate.toDateString() === new Date().toDateString();
  const isPast = startDate < new Date();

  return (
    <div className={`glass-card rounded-xl p-4 transition-all duration-200 hover:bg-white/20 ${
      isToday ? 'ring-2 ring-accent' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              isPast ? 'bg-gray-400' : isToday ? 'bg-accent' : 'bg-primary'
            }`}></div>
            <h3 className="text-lg font-semibold text-white">{event.title}</h3>
            <button
              onClick={() => onDelete(event.id)}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
          
          <div className="space-y-2 ml-6">
            <div className="flex items-center space-x-2 text-white/80">
              <Clock className="w-4 h-4" />
              <span>
                {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                {endDate && ` - ${endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
              </span>
            </div>
            
            {event.location && (
              <div className="flex items-center space-x-2 text-white/80">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}
            
            {event.attendees && (
              <div className="text-white/60 text-sm">
                👥 {event.attendees}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
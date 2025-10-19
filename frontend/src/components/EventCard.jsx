import React from 'react';
import { formatTimeForDisplay } from '../utils/dateTime';
import { useAuth } from '../contexts/AuthContext';
import './EventCard.css';

const EventCard = ({ event, onClick }) => {
  const { user } = useAuth();
  // Always use the browser timezone for accurate local time
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const viewerTimezone = event.viewerTimezone || user?.timezone || browserTimezone;
  
  // If the event has an organizer timezone, use it for context
  const eventTimezone = event.timezone || browserTimezone;

  // Get event category for styling
  const getEventCategory = () => {
    if (event.category) return event.category.toLowerCase();
    if (event.title.toLowerCase().includes('meeting')) return 'meeting';
    if (event.title.toLowerCase().includes('work')) return 'work';
    return 'personal';
  };

  const category = getEventCategory();
  
  // Check if event timezone differs from browser timezone
  const isEventTimezoneDifferent = eventTimezone !== viewerTimezone;
  const displayDate = event.startLocal || event.startDateTime;

  return (
    <div
      className={`event-card-modern event-${category}`}
      onClick={() => onClick && onClick(event)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick && onClick(event);
        }
      }}
    >
      <div className="event-card-content">
        <div className="event-title">
          {event.title}
        </div>
        <div className="event-time">
          {/* Always display time in the local browser timezone */}
          {formatTimeForDisplay(displayDate, viewerTimezone)}
          
          {/* Show browser timezone name for clarity */}
          <span style={{fontSize: '10px', display: 'block', color: '#666'}}>
            {viewerTimezone.includes('/') 
              ? viewerTimezone.split('/')[1].replace('_', ' ')
              : viewerTimezone}
          </span>
          
          {/* Show organizer's timezone if different */}
          {isEventTimezoneDifferent && (
            <span style={{fontSize: '9px', display: 'block', color: '#888', fontStyle: 'italic', marginTop: '2px'}}>
              Organizer: {eventTimezone.includes('/')
                ? eventTimezone.split('/')[1].replace('_', ' ')
                : eventTimezone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;

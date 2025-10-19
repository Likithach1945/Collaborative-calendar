import React from 'react';
import { formatTimeForDisplay } from '../utils/dateTime';
import { useAuth } from '../contexts/AuthContext';
import './EventCard.css';

const SimpleEventCard = ({ event, onClick }) => {
  const { user } = useAuth();
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const userTimezone = user?.timezone || browserTimezone;
  const viewerTimezone = (event?.viewerTimezone && event.viewerTimezone !== 'UTC'
    ? event.viewerTimezone
    : event?.userTimezone || userTimezone);
  
  // We don't need the debug logs anymore

  // Get event category for styling
  const getEventCategory = () => {
    if (event.category) return event.category.toLowerCase();
    if (event.title.toLowerCase().includes('meeting')) return 'meeting';
    if (event.title.toLowerCase().includes('work')) return 'work';
    return 'personal';
  };

  const category = getEventCategory();

  return (
    <div
      className={`event-card-modern simple-card event-${category}`}
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
          {formatTimeForDisplay(event.startLocal || event.startDateTime, viewerTimezone)}
          {/* Only show timezone indicator if it's different from the organizer's timezone */}
          {event.isDifferentTimezone && (
            <span style={{fontSize: '10px', display: 'block', color: '#666'}}>
              {viewerTimezone.includes('/') 
                ? viewerTimezone.split('/')[1].replace('_', ' ')
                : viewerTimezone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleEventCard;
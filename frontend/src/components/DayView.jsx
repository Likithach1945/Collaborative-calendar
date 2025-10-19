import React from 'react';
import { format, isToday } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { useAuth } from '../contexts/AuthContext';
import { utcToTimezone, getDayBoundaries } from '../utils/dateTime';
import { useEvents } from '../hooks/useEvents';
import SimpleEventCard from './SimpleEventCard';

const DayView = ({ date, onEventClick }) => {
  const { user } = useAuth();
  // Use browser timezone if user timezone is not set
  const timezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Get day boundaries in UTC for API query
  const { start, end } = getDayBoundaries(date, timezone);
  const { data: events = [], isLoading, error } = useEvents(start, end);

  const localDate = utcToTimezone(date, timezone);
  
  // Hours array (24 hours)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filter events for this day
  const dayStart = new Date(localDate).setHours(0, 0, 0, 0);
  const dayEnd = new Date(localDate).setHours(23, 59, 59, 999);

  const dayEvents = events.filter((event) => {
    const eventStartDate = event.startLocal || event.startDateTime;
    const eventStart = eventStartDate instanceof Date
      ? eventStartDate.getTime()
      : new Date(eventStartDate).getTime();
    return eventStart >= dayStart && eventStart <= dayEnd;
  });

  if (isLoading) {
    return (
      <div className="calendar-loading">
        Loading events...
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar-loading" style={{ color: 'var(--google-red)' }}>
        Error loading events: {error.message}
      </div>
    );
  }

  // Separate all-day and timed events
  const allDayEvents = dayEvents.filter(event => {
    const start = event.startLocal || utcToZonedTime(new Date(event.startDateTime), timezone);
    const end = event.endLocal || utcToZonedTime(new Date(event.endDateTime), timezone);
    const duration = (end - start) / (1000 * 60 * 60);
    return duration >= 24 || (start.getHours() === 0 && start.getMinutes() === 0 && end.getHours() === 23 && end.getMinutes() === 59);
  });

  const timedEvents = dayEvents.filter(event => {
    const start = event.startLocal || utcToZonedTime(new Date(event.startDateTime), timezone);
    const end = event.endLocal || utcToZonedTime(new Date(event.endDateTime), timezone);
    const duration = (end - start) / (1000 * 60 * 60);
    return duration < 24 && !(start.getHours() === 0 && start.getMinutes() === 0 && end.getHours() === 23 && end.getMinutes() === 59);
  });

  return (
    <div className="day-view">
      {/* Day Header - Compact */}
      <div className="day-header-compact">
        <div className="day-number">{format(date, 'd')}</div>
        <div className="day-name-compact">{format(date, 'EEEE')}</div>
      </div>

      {/* All-day events section */}
      {allDayEvents.length > 0 && (
        <div className="all-day-events-section">
          {allDayEvents.map((event) => (
            <div
              key={event.id}
              className={`all-day-event ${event.category || 'personal'}`}
              onClick={() => onEventClick && onEventClick(event)}
            >
              <div className="all-day-event-indicators">
                <span className="event-chevron">‹</span>
                <span className="event-chevron-right">›</span>
              </div>
              <div className="all-day-event-content">
                <span className="all-day-event-title">{event.title}</span>
                {event.location && <span className="all-day-event-location">{event.location}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Time Grid */}
      <div className="time-grid day-time-grid">
        {/* Time Labels Column */}
        <div className="time-labels">
          {hours.map((hour) => (
            <div key={hour} className="time-slot">
              {hour === 0 ? '' : format(new Date().setHours(hour, 0, 0, 0), 'ha')}
            </div>
          ))}
        </div>

        {/* Day Column */}
        <div className="day-column">
          {/* Hour grid lines */}
          {hours.map((hour) => (
            <div
              key={`line-${hour}`}
              className={`hour-line ${hour % 3 === 0 ? 'major' : ''}`}
              style={{ top: `${hour * 48}px` }}
            />
          ))}

          {/* Timed Events for this day */}
          {timedEvents.map((event) => {
            // Convert UTC event time to user's timezone
            const eventStart = event.startLocal || utcToZonedTime(new Date(event.startDateTime), timezone);
            const eventEnd = event.endLocal || utcToZonedTime(new Date(event.endDateTime), timezone);
            const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
            const duration = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60);
            
            return (
              <div
                key={event.id}
                className="calendar-event-wrapper day-event-wrapper"
                style={{
                  top: `${startHour * 48}px`,
                  height: `${Math.max(duration * 48, 50)}px`,
                }}
              >
                <SimpleEventCard
                  event={event}
                  onClick={() => onEventClick && onEventClick(event)}
                />
              </div>
            );
          })}

          {/* Current time indicator */}
          {isToday(localDate) && (
            <div
              className="current-time-line"
              style={{
                top: `${(new Date().getHours() + new Date().getMinutes() / 60) * 48}px`,
              }}
            >
              <div className="current-time-dot" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayView;

import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isToday,
  isSameDay 
} from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { utcToTimezone, getMonthBoundaries } from '../utils/dateTime';
import { useEvents } from '../hooks/useEvents';
import EventCard from './EventCard';

const MonthView = ({ date, onEventClick }) => {
  const { user } = useAuth();
  // Use browser timezone if user timezone is not set
  const timezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Get month boundaries in UTC for API query
  const { start, end } = getMonthBoundaries(date, timezone);
  const { data: events = [], isLoading, error } = useEvents(start, end);

  // Get the calendar grid (6 weeks)
  const monthStart = startOfMonth(utcToTimezone(date, timezone));
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Generate all days in the calendar grid
  const days = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Group events by day
  const eventsByDay = days.map((dayDate) => {
    const dayStart = new Date(dayDate).setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayDate).setHours(23, 59, 59, 999);

    return {
      date: dayDate,
      events: events.filter((event) => {
        const eventStartDate = event.startLocal || event.startDateTime;
        const eventStart = eventStartDate instanceof Date
          ? eventStartDate.getTime()
          : new Date(eventStartDate).getTime();
        return eventStart >= dayStart && eventStart <= dayEnd;
      }),
    };
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

  return (
    <div className="month-view">
      {/* Day names header */}
      <div className="month-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
          <div key={dayName} className="month-header-day">
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="month-grid">
        {eventsByDay.map(({ date: dayDate, events: dayEvents }, index) => {
          const isCurrentMonth = isSameMonth(dayDate, monthStart);
          const isCurrentDay = isToday(dayDate);

          return (
            <div
              key={index}
              className={`month-day ${!isCurrentMonth ? 'other-month' : ''} ${isCurrentDay ? 'today' : ''}`}
            >
              <div className="day-number">
                {format(dayDate, 'd')}
              </div>
              <div className="day-events">
                {dayEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="month-event-wrapper">
                    <EventCard
                      event={event}
                      onClick={() => onEventClick && onEventClick(event)}
                    />
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="more-events">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;

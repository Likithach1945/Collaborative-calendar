import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { useAuth } from '../contexts/AuthContext';
import { utcToTimezone, getWeekBoundaries } from '../utils/dateTime';
import { useEvents } from '../hooks/useEvents';
import SimpleEventCard from './SimpleEventCard';

const WeekView = ({ date, onEventClick }) => {
  const { user } = useAuth();
  // Use browser timezone if user timezone is not set
  const timezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Get week boundaries in UTC for API query
  const { start, end } = getWeekBoundaries(date, timezone);
  const { data: events = [], isLoading, error } = useEvents(start, end);

  // Get the start of the week in user's timezone
  const weekStart = startOfWeek(utcToTimezone(date, timezone), { weekStartsOn: 0 }); // Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Hours array (24 hours)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Group events by day
  const eventsByDay = weekDays.map((day) => {
    const dayStart = day.setHours(0, 0, 0, 0);
    const dayEnd = day.setHours(23, 59, 59, 999);

    return {
      date: day,
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
    <div className="week-view">
      {/* Week Header */}
      <div className="week-header">
        <div className="week-header-day"></div> {/* Empty cell for time column */}
        {weekDays.map((dayDate) => (
          <div 
            key={dayDate.toISOString()}
            className={`week-header-day ${isToday(dayDate) ? 'today' : ''}`}
          >
            <div className="day-name">{format(dayDate, 'EEE')}</div>
            <div className="day-number">{format(dayDate, 'd')}</div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="time-grid">
        {/* Time Labels Column */}
        <div className="time-labels">
          {hours.map((hour) => (
            <div key={hour} className="time-slot">
              {hour === 0 ? '' : format(new Date().setHours(hour, 0, 0, 0), 'ha')}
            </div>
          ))}
        </div>

        {/* Week Body with Day Columns */}
        <div className="week-body">
          {/* Hour grid lines spanning all columns */}
          {hours.map((hour) => (
            <div
              key={`line-${hour}`}
              className={`hour-line ${hour % 3 === 0 ? 'major' : ''}`}
              style={{ 
                top: `${hour * 48}px`,
                left: 0,
                right: 0,
                position: 'absolute',
                gridColumn: '1 / -1'
              }}
            />
          ))}

          {/* Day columns */}
          {eventsByDay.map(({ date: dayDate, events: dayEvents }, dayIndex) => (
            <div
              key={dayDate.toISOString()}
              className="week-day-column"
              style={{ gridColumn: dayIndex + 1 }}
            >
              {/* Events for this day */}
              {dayEvents.map((event) => {
                const eventStart = event.startLocal || utcToZonedTime(new Date(event.startDateTime), timezone);
                const eventEnd = event.endLocal || utcToZonedTime(new Date(event.endDateTime), timezone);
                const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
                const duration = Math.max((eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60), 0);
                
                return (
                  <div
                    key={event.id}
                    className="calendar-event-wrapper"
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
            </div>
          ))}

          {/* Current time indicator */}
          {weekDays.some(day => isToday(day)) && (
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

export default WeekView;

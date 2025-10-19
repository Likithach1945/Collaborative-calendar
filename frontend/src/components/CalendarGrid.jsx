import React, { useState } from 'react';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import EventDetailModal from './EventDetailModal';
import './CalendarGrid.css';

const CalendarGrid = ({ viewMode = 'week', currentDate = new Date(), onDateChange }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="calendar-grid-container">
      {/* Modern Calendar Body */}
      <div className="calendar-body">
        {viewMode === 'day' ? (
          <DayView date={currentDate} onEventClick={handleEventClick} />
        ) : viewMode === 'month' ? (
          <MonthView date={currentDate} onEventClick={handleEventClick} />
        ) : (
          <WeekView date={currentDate} onEventClick={handleEventClick} />
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default CalendarGrid;

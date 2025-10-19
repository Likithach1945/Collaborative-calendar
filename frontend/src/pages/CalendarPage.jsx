import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import CalendarGrid from '../components/CalendarGrid';
import EventCreateForm from '../components/EventCreateForm';
import Avatar from '../components/Avatar';
import NotificationBadge from '../components/NotificationBadge';
import { useCreateEvent } from '../hooks/useCreateEvent';
import { apiClient } from '../api/client';
import { Upload } from 'lucide-react';
import './CalendarPage.css';

const CalendarPage = () => {
  const { user, logout } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showICSModal, setShowICSModal] = useState(false);
  const [icsFile, setIcsFile] = useState(null);
  const [icsErrors, setIcsErrors] = useState([]);
  const [icsStatus, setIcsStatus] = useState(null);
  const [icsUploading, setIcsUploading] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', or 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());
  const createEventMutation = useCreateEvent();
  const queryClient = useQueryClient();
  const icsFileInputRef = useRef(null);
  const monthButtonRef = useRef(null);
  const yearButtonRef = useRef(null);
  const monthPickerRef = useRef(null);
  const yearPickerRef = useRef(null);
  const activeYearRef = useRef(null);

  // Fetch pending invitations count for notification badge
  const { data: invitations = [] } = useQuery({
    queryKey: ['user-invitations', 'pending'],
    queryFn: async () => {
      try {
        const data = await apiClient.get('/invitations?status=PENDING');
        return data || [];
      } catch (err) {
        console.error('Error fetching invitations count:', err);
        return [];
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const pendingCount = invitations.length;

  const handleCreateEvent = async (eventData) => {
    try {
      await createEventMutation.mutateAsync(eventData);
      setShowCreateForm(false);
    } catch (error) {
      // Error is already logged in the mutation
      throw error; // Re-throw so form can display error
    }
  };

  const handlePrevious = () => {
    if (viewMode === 'day') {
      setCurrentDate(prev => new Date(prev.setDate(prev.getDate() - 1)));
    } else if (viewMode === 'week') {
      setCurrentDate(prev => new Date(prev.setDate(prev.getDate() - 7)));
    } else {
      setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() - 1)));
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      setCurrentDate(prev => new Date(prev.setDate(prev.getDate() + 1)));
    } else if (viewMode === 'week') {
      setCurrentDate(prev => new Date(prev.setDate(prev.getDate() + 7)));
    } else {
      setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + 1)));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setMiniCalendarDate(today);
  };


  const monthNames = useMemo(() => (
    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  ), []);

  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const yearOptions = useMemo(() => {
    const years = [];
    for (let year = 1900; year <= 2100; year += 1) {
      years.push(year);
    }
    return years;
  }, []);

  const dayLabel = useMemo(() => {
    if (viewMode !== 'day') {
      return null;
    }
    return currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' });
  }, [viewMode, currentDate]);

  const handleMiniCalendarPrevious = () => {
    setMiniCalendarDate(prev => subMonths(prev, 1));
  };

  const handleMiniCalendarNext = () => {
    setMiniCalendarDate(prev => addMonths(prev, 1));
  };

  const handleMiniDateClick = (date) => {
    setCurrentDate(date);
    if (viewMode !== 'day') {
      setViewMode('day');
    }
  };

  // Generate mini calendar grid
  const generateMiniCalendar = () => {
    const monthStart = startOfMonth(miniCalendarDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const miniCalendarDays = generateMiniCalendar();

  const handleIcsFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.ics')) {
      setIcsErrors(['Please select a valid .ics file']);
      setIcsFile(null);
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setIcsErrors(['File size must be under 10MB']);
      setIcsFile(null);
      return;
    }

    setIcsFile(file);
    setIcsErrors([]);
    setIcsStatus(null);
  };

  const resetIcsState = () => {
    setIcsFile(null);
    setIcsErrors([]);
    setIcsStatus(null);
    setIcsUploading(false);
    if (icsFileInputRef.current) {
      icsFileInputRef.current.value = '';
    }
  };

  const closeIcsModal = () => {
    setShowICSModal(false);
    resetIcsState();
  };

  const handleIcsImport = async () => {
    if (!icsFile) {
      setIcsErrors(['Please choose an .ics file to import']);
      return;
    }

    try {
      setIcsUploading(true);
      setIcsErrors([]);
      setIcsStatus(null);

      const formData = new FormData();
      formData.append('file', icsFile);

      const result = await apiClient.post('/ics/import', formData);
      setIcsStatus(result);
      setIcsFile(null);
      if (icsFileInputRef.current) {
        icsFileInputRef.current.value = '';
      }
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    } catch (error) {
      const message = error?.data?.error || error?.message || 'Failed to import ICS file';
      setIcsErrors([message]);
      setIcsStatus(null);
    } finally {
      setIcsUploading(false);
    }
  };

  const toggleMonthPicker = () => {
    setShowMonthPicker(prev => !prev);
    setShowYearPicker(false);
  };

  const toggleYearPicker = () => {
    setShowYearPicker(prev => !prev);
    setShowMonthPicker(false);
  };

  const handleMonthSelect = (monthIndex) => {
    const updated = new Date(currentDate.getTime());
    const originalDay = updated.getDate();
    updated.setDate(1);
    updated.setMonth(monthIndex);
    const maxDay = new Date(updated.getFullYear(), updated.getMonth() + 1, 0).getDate();
    updated.setDate(Math.min(originalDay, maxDay));
    setCurrentDate(updated);
    setMiniCalendarDate(new Date(updated.getFullYear(), updated.getMonth(), 1));
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year) => {
    const updated = new Date(currentDate.getTime());
    const month = updated.getMonth();
    const originalDay = updated.getDate();
    updated.setDate(1);
    updated.setFullYear(year);
    const maxDay = new Date(updated.getFullYear(), month + 1, 0).getDate();
    updated.setMonth(month);
    updated.setDate(Math.min(originalDay, maxDay));
    setCurrentDate(updated);
    setMiniCalendarDate(new Date(year, updated.getMonth(), 1));
    setShowYearPicker(false);
  };

  useEffect(() => {
    if (!showMonthPicker && !showYearPicker) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (showMonthPicker) {
        const isOutsideMonth =
          monthPickerRef.current &&
          !monthPickerRef.current.contains(event.target) &&
          monthButtonRef.current &&
          !monthButtonRef.current.contains(event.target);
        if (isOutsideMonth) {
          setShowMonthPicker(false);
        }
      }
      if (showYearPicker) {
        const isOutsideYear =
          yearPickerRef.current &&
          !yearPickerRef.current.contains(event.target) &&
          yearButtonRef.current &&
          !yearButtonRef.current.contains(event.target);
        if (isOutsideYear) {
          setShowYearPicker(false);
        }
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowMonthPicker(false);
        setShowYearPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showMonthPicker, showYearPicker]);

  useEffect(() => {
    if (showYearPicker && activeYearRef.current) {
      activeYearRef.current.scrollIntoView({ block: 'center' });
    }
  }, [showYearPicker]);

  return (
    <div className="calendar-page">
      {/* Google-style Header */}
      <header className="calendar-header">
        <div className="header-left">
          <div className="app-title">
            <div className="app-logo">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="8" width="28" height="26" rx="3" fill="#1a73e8" />
                <rect x="6" y="8" width="28" height="8" rx="3" fill="#185abc" />
                <rect x="10" y="4" width="3" height="8" rx="1.5" fill="#5f6368" />
                <rect x="27" y="4" width="3" height="8" rx="1.5" fill="#5f6368" />
                <circle cx="13" cy="21" r="1.5" fill="white" />
                <circle cx="20" cy="21" r="1.5" fill="white" />
                <circle cx="27" cy="21" r="1.5" fill="white" />
                <circle cx="13" cy="27" r="1.5" fill="white" />
                <circle cx="20" cy="27" r="1.5" fill="white" />
                <circle cx="27" cy="27" r="1.5" fill="white" />
              </svg>
            </div>
            <h1>Calendar</h1>
          </div>
          <button 
            className="create-btn"
            onClick={() => setShowCreateForm(true)}
          >
            <span className="create-icon">+</span>
            Create
          </button>
          <button
            className="import-btn"
            onClick={() => {
              resetIcsState();
              setShowICSModal(true);
            }}
          >
            <Upload className="import-icon" size={16} />
            Import
          </button>
        </div>
        
        <div className="header-center">
          <div className="view-controls">
            <button className="nav-btn" onClick={handlePrevious}>‹</button>
            <button className="today-btn" onClick={handleToday}>Today</button>
            <button className="nav-btn" onClick={handleNext}>›</button>
          </div>
          <div className="current-date">
            {dayLabel && <span className="current-day-label">{dayLabel}</span>}
            <div className="date-selector">
              <div className="date-selector-group">
                <button
                  type="button"
                  ref={monthButtonRef}
                  className="date-selector-button"
                  onClick={toggleMonthPicker}
                  aria-expanded={showMonthPicker}
                >
                  {monthNames[currentMonthIndex]}
                </button>
                {showMonthPicker && (
                  <div ref={monthPickerRef} className="date-picker-popover month-picker" role="listbox" aria-label="Select month">
                    {monthNames.map((month, index) => (
                      <button
                        type="button"
                        key={month}
                        onClick={() => handleMonthSelect(index)}
                        className={`date-picker-option ${index === currentMonthIndex ? 'active' : ''}`}
                        role="option"
                        aria-selected={index === currentMonthIndex}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="date-selector-group">
                <button
                  type="button"
                  ref={yearButtonRef}
                  className="date-selector-button"
                  onClick={toggleYearPicker}
                  aria-expanded={showYearPicker}
                >
                  {currentYear}
                </button>
                {showYearPicker && (
                  <div ref={yearPickerRef} className="date-picker-popover year-picker" role="listbox" aria-label="Select year">
                    {yearOptions.map(year => (
                      <button
                        type="button"
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={`date-picker-option ${year === currentYear ? 'active' : ''}`}
                        ref={year === currentYear ? activeYearRef : null}
                        role="option"
                        aria-selected={year === currentYear}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <div className="view-switcher">
            <button 
              className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
            <button 
              className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
          </div>
          
          <Link 
            to="/invitations" 
            className="invitations-link notification-icon-wrapper"
          >
            Invitations
            {pendingCount > 0 && <NotificationBadge count={pendingCount} variant="pending" />}
          </Link>
          
          <div className="user-menu">
            <Avatar 
              name={user?.displayName} 
              email={user?.email}
              size={32}
              fontSize={14}
            />
            <span className="user-name">{user?.displayName || user?.email}</span>
            <button 
              className="logout-btn"
              onClick={logout}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Calendar Content */}
      <div className="calendar-content">
        {/* Sidebar */}
        <aside className="calendar-sidebar">
          <div className="mini-calendar">
            <div className="mini-calendar-header">
              <span className="mini-month">{format(miniCalendarDate, 'MMMM yyyy')}</span>
              <div className="mini-nav-buttons">
                <button className="mini-nav" onClick={handleMiniCalendarPrevious} aria-label="Previous month">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M8 10L4 6L8 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="mini-nav" onClick={handleMiniCalendarNext} aria-label="Next month">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Day headers */}
            <div className="mini-calendar-weekdays">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="mini-weekday">{day}</div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="mini-calendar-grid">
              {miniCalendarDays.map((day, index) => {
                const isCurrentMonth = isSameMonth(day, miniCalendarDate);
                const isCurrentDay = isToday(day);
                const isSelected = isSameDay(day, currentDate);

                return (
                  <button
                    key={index}
                    className={`mini-day ${!isCurrentMonth ? 'other-month' : ''} ${isCurrentDay ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleMiniDateClick(day)}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Calendar Grid */}
        <main className="calendar-main">
          <CalendarGrid 
            viewMode={viewMode}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        </main>
      </div>

      {/* ICS Import Modal */}
      {showICSModal && (
        <div className="modal-overlay" onClick={closeIcsModal}>
          <div className="modal-content ics-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ics-modal-header">
              <h2>Import Events (.ics)</h2>
              <button type="button" className="ics-close-btn" onClick={closeIcsModal} aria-label="Close import dialog">
                ×
              </button>
            </div>
            <div className="ics-modal-body">
              <p className="ics-modal-description">
                Upload a standard .ics file to import calendar events. Recurring events and timezones are automatically handled.
              </p>

              <label className="ics-file-picker" htmlFor="ics-file-input">
                <input
                  id="ics-file-input"
                  ref={icsFileInputRef}
                  type="file"
                  accept=".ics,text/calendar"
                  onChange={handleIcsFileChange}
                />
                <span>Select .ics file</span>
              </label>

              {icsFile && (
                <div className="ics-file-info" role="status">
                  <strong>{icsFile.name}</strong>
                  <span>{(icsFile.size / 1024).toFixed(1)} KB</span>
                </div>
              )}

              {icsErrors.length > 0 && (
                <div className="ics-error" role="alert">
                  {icsErrors.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              )}

              {icsStatus && (
                <div className="ics-summary" role="status">
                  <div className="ics-summary-row">
                    <span>Imported</span>
                    <strong>{icsStatus.importedCount ?? 0}</strong>
                  </div>
                  <div className="ics-summary-row">
                    <span>Duplicates</span>
                    <strong>{icsStatus.duplicateCount ?? 0}</strong>
                  </div>
                  <div className="ics-summary-row">
                    <span>Errors</span>
                    <strong>{icsStatus.errorCount ?? 0}</strong>
                  </div>
                  {Array.isArray(icsStatus.errors) && icsStatus.errors.length > 0 && (
                    <div className="ics-summary-errors">
                      <div className="ics-summary-errors-title">Details</div>
                      <ul>
                        {icsStatus.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="ics-modal-actions">
              <button type="button" className="ics-secondary-btn" onClick={closeIcsModal} disabled={icsUploading}>
                Close
              </button>
              <button
                type="button"
                className="ics-primary-btn"
                onClick={handleIcsImport}
                disabled={icsUploading || !icsFile}
              >
                {icsUploading ? 'Importing…' : 'Import Events'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Creation Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <EventCreateForm
              onSubmit={handleCreateEvent}
              onCancel={() => setShowCreateForm(false)}
              isSubmitting={createEventMutation.isPending}
              userTimezone={user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;

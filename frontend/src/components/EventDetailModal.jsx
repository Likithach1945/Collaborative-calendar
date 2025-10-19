import React, { useState } from 'react';
import { format } from 'date-fns';
import { formatInTimeZone, utcToZonedTime } from 'date-fns-tz';
import { X, Calendar, Clock, MapPin, User, Users, Video, Trash2, AlertCircle } from 'lucide-react';
import AttendeesList from './AttendeesList';
import TimezoneInfo from './TimezoneInfo';
import { useAuth } from '../contexts/AuthContext';
import { useDeleteEvent } from '../hooks/useEvents';

const EventDetailModal = ({ event, onClose }) => {
  const { user } = useAuth();
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const viewerTimezone = (event?.viewerTimezone && event.viewerTimezone !== 'UTC'
    ? event.viewerTimezone
    : event?.userTimezone || user?.timezone || browserTimezone);
  const normalizeToDate = (value) => {
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return value;
    }
    return new Date(value);
  };
  const startForDisplay = normalizeToDate(event?.startLocal || event?.startDateTimeLocalized || event?.startDateTime);
  const endForDisplay = normalizeToDate(event?.endLocal || event?.endDateTimeLocalized || event?.endDateTime);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState(null);
  const deleteEventMutation = useDeleteEvent();

  if (!event) return null;

  const isOrganizer = event.organizerEmail === user?.email;
  
  const handleDeleteEvent = async () => {
    try {
      setDeletionStatus('deleting');
      await deleteEventMutation.mutateAsync(event.id);
      setDeletionStatus('success');
      
      // Show success message for 2 seconds before closing
      setTimeout(() => {
        onClose(); // Close the modal after successful deletion
      }, 2000);
    } catch (error) {
      console.error('Error deleting event:', error);
      setDeletionStatus('error');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
    >
      <div
        style={{
          backgroundColor: 'var(--background)',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '24px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ flex: 1 }}>
            <h2
              id="event-detail-title"
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 600,
                color: 'var(--text)',
              }}
            >
              {event.title}
            </h2>
            {isOrganizer && (
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '8px',
                  padding: '4px 8px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                Organizer
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--border)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Event Details */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Date and Time */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Calendar size={20} color="var(--text-secondary)" style={{ marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, color: 'var(--text)' }}>
                  {startForDisplay ? formatInTimeZone(startForDisplay, viewerTimezone, 'EEEE, MMMM d, yyyy') : '—'}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={16} />
                  <span>
                    {startForDisplay ? formatInTimeZone(startForDisplay, viewerTimezone, 'h:mm a') : '—'} -{' '}
                    {endForDisplay ? formatInTimeZone(endForDisplay, viewerTimezone, 'h:mm a') : '—'}
                    {' '}
                    <span style={{ fontWeight: 'bold' }}>
                      {/* Always show the user's timezone for the time */}
                      {startForDisplay ? formatInTimeZone(startForDisplay, viewerTimezone, 'zzz') : viewerTimezone}
                    </span>
                  </span>
                </div>
                
                {/* Display organizer's timezone if different */}
                {event.timezone && event.timezone !== viewerTimezone && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#1a73e8', 
                    marginTop: '6px',
                    backgroundColor: '#e8f0fe',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    <strong>Organizer's timezone:</strong> {startForDisplay ? formatInTimeZone(startForDisplay, event.timezone, 'zzz') : event.timezone} 
                    ({event.timezone.includes('/') ? event.timezone.split('/')[1].replace('_', ' ') : event.timezone})
                  </div>
                )}
                
                {/* Display user's timezone context */}
                <div style={{ fontSize: '12px', color: '#5f6368', marginTop: '6px' }}>
                  Your timezone: {viewerTimezone.includes('/') 
                    ? viewerTimezone.split('/')[1].replace('_', ' ')
                    : viewerTimezone}
                </div>
                
                {/* Timezone Information - Always show when timezones differ */}
                <TimezoneInfo
                  startDateTime={event.startDateTimeLocalized || event.startDateTime}
                  endDateTime={event.endDateTimeLocalized || event.endDateTime}
                  organizerTimezone={event.timezone || 'UTC'}
                  viewerTimezone={viewerTimezone}
                />
              </div>
            </div>            {/* Location */}
            {event.location && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <MapPin size={20} color="var(--text-secondary)" style={{ marginTop: '2px' }} />
                <div style={{ color: 'var(--text)' }}>{event.location}</div>
              </div>
            )}
            
            {/* Video Conference Link */}
            {event.videoConferenceLink && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Video size={20} color="var(--primary)" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Video Conference</div>
                  <a 
                    href={event.videoConferenceLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      // Validate the link before opening
                      if (!event.videoConferenceLink || event.videoConferenceLink.trim() === '') {
                        e.preventDefault();
                        alert('Video conference link is not available for this event.');
                      }
                    }}
                    style={{ 
                      color: 'var(--primary)', 
                      textDecoration: 'none',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      marginTop: '4px',
                      padding: '6px 12px',
                      backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(var(--primary-rgb), 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(var(--primary-rgb), 0.1)';
                    }}
                  >
                    Join Meeting
                  </a>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {event.videoConferenceLink && (
                      <code style={{ 
                        backgroundColor: 'var(--border)', 
                        padding: '2px 6px', 
                        borderRadius: '3px',
                        wordBreak: 'break-all'
                      }}>
                        {event.videoConferenceLink}
                      </code>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Organizer */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <User size={20} color="var(--text-secondary)" style={{ marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Organizer</div>
                <div style={{ color: 'var(--text)', marginTop: '2px', fontWeight: 500 }}>
                  {event.organizerName || event.organizerEmail}
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '16px',
                  backgroundColor: 'var(--border)',
                  borderRadius: '4px',
                }}
              >
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Description
                </div>
                <div style={{ color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                  {event.description}
                </div>
              </div>
            )}

            {/* Attendees List - visible to everyone */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Users size={20} color="var(--text-secondary)" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
                  Attendees
                </h3>
              </div>
              <AttendeesList eventId={event.id} />
            </div>
            
            {/* Delete button - only for organizers */}
            {isOrganizer && (
              <div style={{ 
                marginTop: '24px', 
                borderTop: '1px solid var(--border)', 
                paddingTop: '24px',
                textAlign: 'center'
              }}>
                {deletionStatus === 'success' ? (
                  <div style={{ 
                    backgroundColor: '#e6f4ea', 
                    padding: '16px', 
                    borderRadius: '8px',
                    border: '1px solid #ceead6',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: '#137333', marginBottom: '8px', fontWeight: 600 }}>
                      Event successfully deleted
                    </div>
                    <div style={{ fontSize: '14px', color: '#1e8e3e' }}>
                      All attendees have been notified that the event was cancelled
                    </div>
                  </div>
                ) : deletionStatus === 'deleting' ? (
                  <div style={{ 
                    backgroundColor: '#e8f0fe', 
                    padding: '16px', 
                    borderRadius: '8px',
                    border: '1px solid #d2e3fc',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: '#1a73e8', marginBottom: '8px', fontWeight: 600 }}>
                      Deleting event and notifying attendees...
                    </div>
                  </div>
                ) : deletionStatus === 'error' ? (
                  <div style={{ 
                    backgroundColor: '#fce8e6', 
                    padding: '16px', 
                    borderRadius: '8px',
                    border: '1px solid #f6cbc7',
                    textAlign: 'center' 
                  }}>
                    <div style={{ color: '#d93025', marginBottom: '8px', fontWeight: 600 }}>
                      Error deleting event
                    </div>
                    <div style={{ fontSize: '14px', color: '#d93025', marginBottom: '12px' }}>
                      There was a problem deleting the event. Please try again.
                    </div>
                    <button
                      onClick={() => setDeletionStatus(null)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        border: '1px solid #dadce0',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '14px'
                      }}
                    >
                      Close
                    </button>
                  </div>
                ) : !showConfirmDelete ? (
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      width: '100%',
                      backgroundColor: '#fce8e6',
                      color: '#d93025',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '16px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f6cbc7';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#fce8e6';
                    }}
                  >
                    <Trash2 size={18} />
                    Delete Event
                  </button>
                ) : (
                  <div style={{ 
                    backgroundColor: '#fce8e6', 
                    padding: '16px', 
                    borderRadius: '8px',
                    border: '1px solid #f6cbc7' 
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '12px',
                      marginBottom: '16px' 
                    }}>
                      <AlertCircle size={20} color="#d93025" />
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', color: '#d93025' }}>
                          Delete this event?
                        </h4>
                        <p style={{ margin: '0', fontSize: '14px', color: '#5f6368' }}>
                          This will cancel the event for all attendees and remove it from their calendars.
                          <strong> All attendees will be notified via email.</strong>
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button
                        onClick={() => setShowConfirmDelete(false)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'transparent',
                          border: '1px solid #dadce0',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: '14px'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteEvent}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#d93025',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: '14px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;

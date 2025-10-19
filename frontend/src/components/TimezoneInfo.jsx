import React from 'react';
import { Clock, Globe } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * Component to display timezone information for events
 * Shows both organizer's and recipient's timezones when they differ
 */
export default function TimezoneInfo({ 
  startDateTime, 
  endDateTime,
  organizerTimezone, 
  viewerTimezone,
  compact = false 
}) {
  // Check if we have valid timezones
  const validOrganizerTZ = organizerTimezone && organizerTimezone !== 'UTC';
  const validViewerTZ = viewerTimezone && viewerTimezone !== 'UTC';
  
  // If timezones are the same, no need to show this component
  if (organizerTimezone === viewerTimezone || !validOrganizerTZ) {
    return null;
  }

  const formatTime = (dateTime, tz) => {
    try {
      return formatInTimeZone(new Date(dateTime), tz, 'h:mm a zzz');
    } catch (e) {
      console.error('Error formatting time with timezone:', e, { dateTime, tz });
      return 'Invalid time';
    }
  };

  const getTimezoneDisplay = (tz) => {
    const parts = tz.split('/');
    return parts[parts.length - 1].replace('_', ' ');
  };

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        backgroundColor: '#e8f0fe',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#1a73e8',
        marginTop: '8px'
      }}>
        <Globe size={14} />
        <span>
          Times shown in your timezone ({getTimezoneDisplay(viewerTimezone)})
        </span>
      </div>
    );
  }

  return (
    <div style={{
      marginTop: '12px',
      padding: '12px',
      backgroundColor: '#f8f9fa',
      borderLeft: '3px solid #1a73e8',
      borderRadius: '4px'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        marginBottom: '8px',
        fontWeight: 600,
        color: '#202124',
        fontSize: '13px'
      }}>
        <Globe size={16} color="#1a73e8" />
        <span>Timezone Information</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
        {/* Your timezone */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={14} color="#34a853" />
          <div>
            <span style={{ color: '#5f6368', fontWeight: 500 }}>Your time: </span>
            <span style={{ color: '#202124' }}>
              {formatTime(startDateTime, viewerTimezone)}
              {endDateTime && ` - ${formatTime(endDateTime, viewerTimezone)}`}
            </span>
          </div>
        </div>
        
        {/* Organizer's timezone */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={14} color="#5f6368" />
          <div>
            <span style={{ color: '#5f6368', fontWeight: 500 }}>Organizer's time: </span>
            <span style={{ color: '#202124' }}>
              {formatTime(startDateTime, organizerTimezone)}
              {endDateTime && ` - ${formatTime(endDateTime, organizerTimezone)}`}
            </span>
          </div>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '8px', 
        fontSize: '11px', 
        color: '#5f6368',
        fontStyle: 'italic'
      }}>
        <Clock size={10} style={{ display: 'inline', marginRight: '4px' }} />
        Times are automatically converted to your timezone
      </div>
    </div>
  );
}

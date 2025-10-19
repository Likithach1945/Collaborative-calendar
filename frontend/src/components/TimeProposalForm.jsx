import React, { useState } from 'react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Calendar, Clock } from 'lucide-react';

/**
 * Form for proposing an alternative time for an event
 * Used within InvitationResponseButtons component
 */
const TimeProposalForm = ({ invitation, onSubmit, onCancel }) => {
  const [proposedStart, setProposedStart] = useState('');
  const [proposedEnd, setProposedEnd] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  
  // Get user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!proposedStart || !proposedEnd) {
      setError('Please select both start and end times');
      return;
    }

    const startDate = new Date(proposedStart);
    const endDate = new Date(proposedEnd);

    if (endDate <= startDate) {
      setError('End time must be after start time');
      return;
    }

    // Submit proposal
    onSubmit({
      proposedStart: startDate.toISOString(),
      proposedEnd: endDate.toISOString(),
      note,
    });
  };

  // Get current event time for reference
  const currentStart = invitation.event?.startDateTime 
    ? new Date(invitation.event.startDateTime)
    : null;
  const currentEnd = invitation.event?.endDateTime 
    ? new Date(invitation.event.endDateTime)
    : null;

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
      }}
    >
      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
        Propose Alternative Time
      </h4>

      {/* Current Time Reference */}
      {currentStart && currentEnd && (
        <div
          style={{
            padding: '8px',
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#6b7280',
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>Current Time (in your timezone):</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} aria-hidden="true" />
            {formatInTimeZone(currentStart, userTimezone, 'EEE, MMM d, yyyy')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Clock size={14} aria-hidden="true" />
            {formatInTimeZone(currentStart, userTimezone, 'h:mm a')} - {formatInTimeZone(currentEnd, userTimezone, 'h:mm a')}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Proposed Start Time */}
        <div style={{ marginBottom: '12px' }}>
          <label
            htmlFor="proposedStart"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '4px',
              color: '#374151',
            }}
          >
            Proposed Start Time *
          </label>
          <input
            type="datetime-local"
            id="proposedStart"
            value={proposedStart}
            onChange={(e) => setProposedStart(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            aria-required="true"
          />
        </div>

        {/* Proposed End Time */}
        <div style={{ marginBottom: '12px' }}>
          <label
            htmlFor="proposedEnd"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '4px',
              color: '#374151',
            }}
          >
            Proposed End Time *
          </label>
          <input
            type="datetime-local"
            id="proposedEnd"
            value={proposedEnd}
            onChange={(e) => setProposedEnd(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            aria-required="true"
          />
        </div>

        {/* Optional Note */}
        <div style={{ marginBottom: '12px' }}>
          <label
            htmlFor="proposalNote"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '4px',
              color: '#374151',
            }}
          >
            Reason for Proposal (optional)
          </label>
          <textarea
            id="proposalNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="e.g., I have a conflict at the original time..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          <div
            style={{
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '4px',
              textAlign: 'right',
            }}
          >
            {note.length} / 500
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            style={{
              padding: '8px 12px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '4px',
              fontSize: '13px',
              marginBottom: '12px',
            }}
          >
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              color: '#374151',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              color: 'white',
              fontWeight: 500,
            }}
          >
            Submit Proposal
          </button>
        </div>
      </form>
    </div>
  );
};

export default TimeProposalForm;

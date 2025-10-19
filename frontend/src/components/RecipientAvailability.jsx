import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import './RecipientAvailability.css';

/**
 * Component to display recipient availability status
 * Shows only Available/Unavailable status without revealing event details (privacy protection)
 */
function RecipientAvailability({ availabilities, isLoading, error, userTimezone, showDetails = false }) {
  // Debug logging
  console.log('🔍 RecipientAvailability component received:');
  console.log('  - availabilities:', availabilities);
  console.log('  - isLoading:', isLoading);
  console.log('  - error:', error);
  
  if (availabilities && availabilities.length > 0) {
    console.log('📊 Individual availability details:');
    availabilities.forEach((recipient, index) => {
      console.log(`  ${index + 1}. ${recipient.participantEmail} (${recipient.participantName}):`, {
        isAvailable: recipient.isAvailable,
        conflicts: recipient.conflicts,
        conflictCount: recipient.conflicts?.length || 0
      });
    });
  }

  if (!availabilities || availabilities.length === 0) {
    console.log('⚠️ No availabilities data - returning null');
    return null;
  }

  const displayTimezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formatSlotWindow = (slot) => {
    if (!slot?.startTime || !slot?.endTime) {
      return null;
    }

    try {
  const startLabel = formatInTimeZone(slot.startTime, displayTimezone, "EEE, MMM d 'at' h:mm a");
  const endLabel = formatInTimeZone(slot.endTime, displayTimezone, "h:mm a");
      const tzLabel = formatInTimeZone(slot.startTime, displayTimezone, 'zzz');
  return `${startLabel} - ${endLabel} ${tzLabel}`;
    } catch (formatError) {
      console.error('Failed to format availability slot', formatError);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="recipient-availability-container">
        <div className="availability-header">
          <Clock size={18} />
          <h4>Checking recipient availability...</h4>
        </div>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipient-availability-container">
        <div className="availability-header">
          <AlertCircle size={18} color="var(--warning)" />
          <h4>Could not check availability</h4>
        </div>
        <p className="availability-error">
          {error?.message || 'Please try again or contact support'}
        </p>
      </div>
    );
  }

  // Calculate summary
  const totalRecipients = availabilities.length;
  const missingCount = availabilities.filter(a => a.userFound === false).length;
  const unavailableCount = availabilities.filter(a => a.userFound !== false && !a.isAvailable).length;

  let summaryLabel;
  if (unavailableCount === 0 && missingCount === 0) {
    summaryLabel = `All ${totalRecipients} available`;
  } else {
    const parts = [];
    if (unavailableCount > 0) {
      parts.push(`${unavailableCount} unavailable`);
    }
    if (missingCount > 0) {
      parts.push(`${missingCount} not found`);
    }
    summaryLabel = parts.join(' • ');
  }

  const summaryClass = unavailableCount > 0 || missingCount > 0 ? 'has-conflicts' : 'all-available';

  return (
    <div className="recipient-availability-container">
      <div className="availability-header">
        <Clock size={18} color="var(--text-secondary)" />
        <h4>Recipient Availability</h4>
        <span className={`availability-summary ${summaryClass}`}>
          {summaryLabel}
        </span>
      </div>

      <div className="availability-list">
        {availabilities.map((recipient) => {
          const isMissing = recipient.userFound === false;
          const itemStateClass = recipient.isAvailable
            ? 'available'
            : (isMissing ? 'missing' : 'conflict');
          const itemClasses = `availability-item ${itemStateClass}`;

          return (
            <div
              key={recipient.participantEmail}
              className={itemClasses}
            >
            <div className="recipient-status">
              {recipient.isAvailable ? (
                <>
                  <CheckCircle size={16} className="status-icon available" />
                  <span className="recipient-name">{recipient.participantName || recipient.participantEmail}</span>
                  <span className="status-label">✓ Available</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} className={`status-icon ${isMissing ? 'missing' : 'conflict'}`} />
                  <span className="recipient-name">{recipient.participantName || recipient.participantEmail}</span>
                  <span className={`status-label ${isMissing ? 'missing-label' : ''}`}>
                    {isMissing ? 'User not found' : '⚠ Unavailable'}
                  </span>
                </>
              )}
            </div>

            {!recipient.isAvailable && !isMissing && recipient.suggestedSlots?.length > 0 && (
              <div className="availability-suggestions" role="list">
                <p className="availability-suggestions__title">Next best slots</p>
                <ul className="availability-suggestions__list">
                  {recipient.suggestedSlots.slice(0, 3).map((slot, index) => {
                    const label = formatSlotWindow(slot);
                    if (!label) {
                      return null;
                    }

                    return (
                      <li
                        key={`${recipient.participantEmail}-slot-${index}`}
                        className="availability-suggestions__item"
                      >
                        <Clock size={14} className="availability-suggestions__icon" aria-hidden="true" />
                        <span>{label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {!recipient.isAvailable && isMissing && (
              <p className="availability-suggestions__empty availability-suggestions__not-found">
                We couldn’t find this user in the system, so availability can’t be checked.
              </p>
            )}

            {!recipient.isAvailable && !isMissing && (!recipient.suggestedSlots || recipient.suggestedSlots.length === 0) && (
              <p className="availability-suggestions__empty">
                No matching free slots found for the next few days.
              </p>
            )}
          </div>
        );
        })}
      </div>

      {(unavailableCount > 0 || missingCount > 0) && (
        <div className="availability-note">
          <AlertCircle size={14} />
          <p>
            {[ 
              unavailableCount > 0
                ? `${unavailableCount} recipient${unavailableCount !== 1 ? 's are' : ' is'} unavailable at this time`
                : null,
              missingCount > 0
                ? `${missingCount} recipient${missingCount !== 1 ? 's were' : ' was'} not found in the system`
                : null
            ].filter(Boolean).join(' • ')}
          </p>
        </div>
      )}
    </div>
  );
}

export default RecipientAvailability;

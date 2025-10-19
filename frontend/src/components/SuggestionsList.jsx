import { formatInTimeZone } from 'date-fns-tz';
import './SuggestionsList.css';

/**
 * Component to display a list of suggested meeting times
 * @param {Object} props
 * @param {Array} props.suggestions - Array of availability slot objects
 * @param {string} props.userTimezone - User's timezone for display
 * @param {Function} props.onSelectSlot - Callback when a slot is selected
 */
export default function SuggestionsList({ suggestions, userTimezone, onSelectSlot }) {
  
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="suggestions-empty" role="status">
        <div className="empty-icon">📅</div>
        <h3>No Available Times Found</h3>
        <p>
          We couldn't find any time slots where all participants are available.
          Try adjusting your search criteria:
        </p>
        <ul>
          <li>Expand the date range</li>
          <li>Reduce the meeting duration</li>
          <li>Check if all participant emails are correct</li>
        </ul>
      </div>
    );
  }

  /**
   * Format a time slot for display in user's timezone
   */
  const formatTimeSlot = (startTime, endTime) => {
    const startFormatted = formatInTimeZone(
      new Date(startTime),
      userTimezone,
      'EEE, MMM d, yyyy h:mm a zzz'
    );
    
    const endFormatted = formatInTimeZone(
      new Date(endTime),
      userTimezone,
      'h:mm a zzz'
    );

    return { start: startFormatted, end: endFormatted };
  };

  /**
   * Calculate duration in minutes
   */
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end - start) / (1000 * 60));
  };

  /**
   * Get score indicator (visual representation of score quality)
   */
  const getScoreIndicator = (score) => {
    if (score >= 95) return '⭐⭐⭐';
    if (score >= 85) return '⭐⭐';
    return '⭐';
  };

  return (
    <div className="suggestions-list">
      <h3>Available Time Slots</h3>
      <p className="suggestions-description">
        Found {suggestions.length} available {suggestions.length === 1 ? 'time' : 'times'} when all participants are free.
        Times are shown in your timezone ({userTimezone}).
      </p>

      <div className="suggestions-grid">
        {suggestions.map((slot, index) => {
          const { start, end } = formatTimeSlot(slot.startTime, slot.endTime);
          const duration = calculateDuration(slot.startTime, slot.endTime);
          const scoreIndicator = getScoreIndicator(slot.score);

          return (
            <div
              key={index}
              className="suggestion-card"
              onClick={() => onSelectSlot && onSelectSlot(slot)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectSlot && onSelectSlot(slot);
                }
              }}
              role={onSelectSlot ? 'button' : 'article'}
              tabIndex={onSelectSlot ? 0 : undefined}
              aria-label={`Suggested time slot: ${start} to ${end}`}
            >
              <div className="suggestion-rank">{index + 1}</div>
              
              <div className="suggestion-content">
                <div className="suggestion-header">
                  <span className="suggestion-score" aria-label={`Quality score: ${slot.score.toFixed(1)}`}>
                    {scoreIndicator}
                  </span>
                  <span className="suggestion-duration">
                    {duration} min
                  </span>
                </div>

                <div className="suggestion-time">
                  <div className="time-start">{start}</div>
                  <div className="time-separator">→</div>
                  <div className="time-end">{end}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="suggestions-legend">
        <small>
          <strong>Score:</strong> ⭐⭐⭐ Excellent · ⭐⭐ Good · ⭐ Fair
        </small>
      </div>
    </div>
  );
}

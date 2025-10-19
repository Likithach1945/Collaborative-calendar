import { useState, useEffect, useRef } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import './SuggestionRequestForm.css';

/**
 * Form component for requesting meeting time suggestions
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback when form is submitted
 * @param {Function} props.onCancel - Callback when form is cancelled
 * @param {string} props.userTimezone - User's timezone
 */
export default function SuggestionRequestForm({ onSubmit, onCancel, userTimezone }) {
  const now = new Date();
  const tomorrow = addDays(now, 1);
  const defaultStart = format(tomorrow, "yyyy-MM-dd'T'09:00");
  const defaultEnd = format(tomorrow, "yyyy-MM-dd'T'17:00");

  const participantsInputRef = useRef(null);

  const [formData, setFormData] = useState({
    participants: '',
    startRange: defaultStart,
    endRange: defaultEnd,
    durationMinutes: 60,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus the participants input when form mounts
  useEffect(() => {
    if (participantsInputRef.current) {
      participantsInputRef.current.focus();
    }
  }, []);

  // Handle Escape key to cancel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onCancel]);

  /**
   * Validate form data
   */
  const validate = () => {
    const newErrors = {};

    if (!formData.participants.trim()) {
      newErrors.participants = 'At least one participant is required';
    } else {
      const emails = formData.participants
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      for (const email of emails) {
        if (!email.includes('@') || !email.includes('.')) {
          newErrors.participants = 'One or more email addresses are invalid';
          break;
        }
      }
    }

    if (!formData.startRange) {
      newErrors.startRange = 'Start date and time is required';
    }

    if (!formData.endRange) {
      newErrors.endRange = 'End date and time is required';
    }

    if (formData.startRange && formData.endRange) {
      const start = new Date(formData.startRange);
      const end = new Date(formData.endRange);
      
      if (end <= start) {
        newErrors.endRange = 'End time must be after start time';
      }
    }

    if (!formData.durationMinutes || formData.durationMinutes <= 0) {
      newErrors.durationMinutes = 'Duration must be positive';
    }

    if (formData.durationMinutes > 480) {
      newErrors.durationMinutes = 'Duration cannot exceed 8 hours';
    }

    return newErrors;
  };

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durationMinutes' ? parseInt(value, 10) || 0 : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert local datetime to UTC
      const startLocal = parseISO(formData.startRange);
      const endLocal = parseISO(formData.endRange);
      
      const startUTC = zonedTimeToUtc(startLocal, userTimezone);
      const endUTC = zonedTimeToUtc(endLocal, userTimezone);

      // Parse participants
      const participantEmails = formData.participants
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      const requestData = {
        participantEmails,
        startRange: startUTC.toISOString(),
        endRange: endUTC.toISOString(),
        durationMinutes: formData.durationMinutes,
      };

      await onSubmit(requestData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: error.message || 'Failed to find available time slots' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="suggestion-request-form" noValidate>
      <h2>Find Available Meeting Times</h2>

      {errors.submit && (
        <div className="error-banner" role="alert" aria-live="assertive">
          {errors.submit}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="participants">
          Participants <span className="required">*</span>
        </label>
        <input
          ref={participantsInputRef}
          type="text"
          id="participants"
          name="participants"
          value={formData.participants}
          onChange={handleChange}
          aria-invalid={!!errors.participants}
          aria-describedby={errors.participants ? 'participants-error' : undefined}
          placeholder="e.g., alice@example.com, bob@example.com"
          required
        />
        {errors.participants && (
          <span id="participants-error" className="error-message" role="alert">
            {errors.participants}
          </span>
        )}
        <small className="form-hint">
          Enter comma-separated email addresses
        </small>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startRange">
            Search Start <span className="required">*</span>
          </label>
          <input
            type="datetime-local"
            id="startRange"
            name="startRange"
            value={formData.startRange}
            onChange={handleChange}
            aria-invalid={!!errors.startRange}
            aria-describedby={errors.startRange ? 'start-error' : undefined}
            required
          />
          {errors.startRange && (
            <span id="start-error" className="error-message" role="alert">
              {errors.startRange}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="endRange">
            Search End <span className="required">*</span>
          </label>
          <input
            type="datetime-local"
            id="endRange"
            name="endRange"
            value={formData.endRange}
            onChange={handleChange}
            aria-invalid={!!errors.endRange}
            aria-describedby={errors.endRange ? 'end-error' : undefined}
            required
          />
          {errors.endRange && (
            <span id="end-error" className="error-message" role="alert">
              {errors.endRange}
            </span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="durationMinutes">
          Meeting Duration (minutes) <span className="required">*</span>
        </label>
        <select
          id="durationMinutes"
          name="durationMinutes"
          value={formData.durationMinutes}
          onChange={handleChange}
          aria-invalid={!!errors.durationMinutes}
          aria-describedby={errors.durationMinutes ? 'duration-error' : undefined}
          required
        >
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={45}>45 minutes</option>
          <option value={60}>1 hour</option>
          <option value={90}>1.5 hours</option>
          <option value={120}>2 hours</option>
          <option value={180}>3 hours</option>
          <option value={240}>4 hours</option>
        </select>
        {errors.durationMinutes && (
          <span id="duration-error" className="error-message" role="alert">
            {errors.durationMinutes}
          </span>
        )}
      </div>

      <div className="form-timezone-info">
        <small>Your timezone: {userTimezone}</small>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Searching...' : 'Find Times'}
        </button>
      </div>
    </form>
  );
}

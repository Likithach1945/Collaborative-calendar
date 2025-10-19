import { useState, useEffect, useRef, useMemo } from 'react';
import { format, parseISO, addHours } from 'date-fns';
import { formatInTimeZone, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { useCheckAvailability } from '../hooks/useCheckAvailability';
import { useFindAvailability } from '../hooks/useFindAvailability';
import RecipientAvailability from './RecipientAvailability';
import SuggestionRequestForm from './SuggestionRequestForm';
import SuggestionsList from './SuggestionsList';
import './EventCreateForm.css';

/**
 * Form component for creating a new event with participants
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback when form is submitted with event data
 * @param {Function} props.onCancel - Callback when form is cancelled
 * @param {string} props.userTimezone - User's timezone
 */
export default function EventCreateForm({ onSubmit, onCancel, userTimezone }) {
  const now = new Date();
  const defaultStart = format(now, "yyyy-MM-dd'T'HH:mm");
  const defaultEnd = format(addHours(now, 1), "yyyy-MM-dd'T'HH:mm");

  const titleInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDateTime: defaultStart,
    endDateTime: defaultEnd,
    location: '',
    participants: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAvailabilityCheck, setShowAvailabilityCheck] = useState(false); // Manual check toggle
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  
  // Parse participants for availability check
  const participantEmails = useMemo(() => {
    if (!formData.participants.trim()) {
      return [];
    }
    return formData.participants
      .split(',')
      .map(email => email.trim())
      .filter(email => email.includes('@') && email.includes('.'));
  }, [formData.participants]);

  // Convert form datetimes to UTC for availability check
  const { startUTC, endUTC } = useMemo(() => {
    if (!formData.startDateTime || !formData.endDateTime) {
      return { startUTC: null, endUTC: null };
    }
    try {
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const startLocal = parseISO(formData.startDateTime);
      const endLocal = parseISO(formData.endDateTime);
      
      console.log('🕐 Timezone Conversion Debug:');
      console.log('  Browser Timezone:', browserTimezone);
      console.log('  Input Start (local):', formData.startDateTime);
      console.log('  Input End (local):', formData.endDateTime);
      console.log('  Parsed Start:', startLocal);
      console.log('  Parsed End:', endLocal);
      
      const startUTC = zonedTimeToUtc(startLocal, browserTimezone);
      const endUTC = zonedTimeToUtc(endLocal, browserTimezone);
      
      console.log('  Converted Start (UTC):', startUTC);
      console.log('  Converted End (UTC):', endUTC);
      
      return { startUTC, endUTC };
    } catch (e) {
      console.error('❌ Timezone conversion error:', e);
      return { startUTC: null, endUTC: null };
    }
  }, [formData.startDateTime, formData.endDateTime]);

  // Check availability for participants (only when manual check is requested)
  const {
    data: availabilityData,
    isLoading: availabilityLoading,
    error: availabilityError,
  } = useCheckAvailability(
    participantEmails,
    startUTC,
    endUTC,
    showAvailabilityCheck && participantEmails.length > 0 // Only when user clicks check button
  );

  const findAvailabilityMutation = useFindAvailability();

  // Get suggested collaborators
  const handleSuggestionRequest = async (requestData) => {
    try {
      const result = await findAvailabilityMutation.mutateAsync(requestData);
      setSuggestions(result);
      setShowSuggestionForm(false);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  const handleSelectSuggestion = (slot) => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const startLocal = utcToZonedTime(new Date(slot.startTime), browserTimezone);
    const endLocal = utcToZonedTime(new Date(slot.endTime), browserTimezone);

    setFormData({
      ...formData,
      startDateTime: format(startLocal, "yyyy-MM-dd'T'HH:mm"),
      endDateTime: format(endLocal, "yyyy-MM-dd'T'HH:mm"),
    });

    setSuggestions([]);
    setShowAvailabilityCheck(true);
  };

  // Focus the title input when form mounts
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
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
   * @returns {Object} Validation errors object
   */
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.startDateTime) {
      newErrors.startDateTime = 'Start date and time is required';
    }

    if (!formData.endDateTime) {
      newErrors.endDateTime = 'End date and time is required';
    }

    if (formData.startDateTime && formData.endDateTime) {
      const start = new Date(formData.startDateTime);
      const end = new Date(formData.endDateTime);
      
      if (end <= start) {
        newErrors.endDateTime = 'End time must be after start time';
      }
    }

    // Validate participant emails
    if (formData.participants.trim()) {
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

    return newErrors;
  };

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
      // Always use browser-detected timezone for accuracy
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Convert local datetime to UTC Instant using browser timezone
      const startLocal = parseISO(formData.startDateTime);
      const endLocal = parseISO(formData.endDateTime);
      
      const startUTC = zonedTimeToUtc(startLocal, browserTimezone);
      const endUTC = zonedTimeToUtc(endLocal, browserTimezone);

      // Parse participants
      const participants = formData.participants
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      // Use the browser-detected timezone to preserve the timezone context
      // Don't use UTC as it loses the context of the organizer's timezone
      const organizerTimezone = browserTimezone;
      console.log('Creating event with browser timezone:', organizerTimezone);
      
      // Debug log to verify time conversions
      console.log('Original local time (input):', formData.startDateTime);
      console.log('Local time formatted:', formatInTimeZone(startLocal, browserTimezone, 'yyyy-MM-dd HH:mm:ss zzz'));
      console.log('UTC time for storage:', startUTC.toISOString());

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        startDateTime: startUTC.toISOString(),
        endDateTime: endUTC.toISOString(),
        timezone: organizerTimezone, // Store the browser-detected timezone
        location: formData.location.trim() || null,
        participants: participants.length > 0 ? participants : null,
      };

      await onSubmit(eventData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: error.message || 'Failed to create event' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add debug logging
  console.log('🔧 EventCreateForm - userTimezone prop:', userTimezone);
  console.log('🌎 Browser timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  return (
    <>
      {showSuggestionForm && (
        <div className="suggestion-modal-overlay">
          <div className="suggestion-modal">
            <SuggestionRequestForm
              onSubmit={handleSuggestionRequest}
              onCancel={() => setShowSuggestionForm(false)}
              userTimezone={userTimezone}
            />
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="suggestion-modal-overlay">
          <div className="suggestion-modal">
            <div className="suggestion-modal-header">
              <h2>Suggested Meeting Times</h2>
              <button
                className="btn-close"
                onClick={() => setSuggestions([])}
                aria-label="Close suggestions"
              >
                ✕
              </button>
            </div>
            <SuggestionsList
              suggestions={suggestions}
              userTimezone={userTimezone}
              onSelectSlot={handleSelectSuggestion}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="event-create-form" noValidate>
        <h2>Create New Event</h2>

        {errors.submit && (
          <div className="error-banner" role="alert" aria-live="assertive">
            {errors.submit}
          </div>
        )}

        <div className="form-body">
          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
              maxLength={255}
              required
            />
            {errors.title && (
              <span id="title-error" className="error-message" role="alert">
                {errors.title}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              maxLength={2000}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDateTime">
                Start Date & Time <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                id="startDateTime"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleChange}
                aria-invalid={!!errors.startDateTime}
                aria-describedby={errors.startDateTime ? 'start-error' : undefined}
                required
              />
              {errors.startDateTime && (
                <span id="start-error" className="error-message" role="alert">
                  {errors.startDateTime}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="endDateTime">
                End Date & Time <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                id="endDateTime"
                name="endDateTime"
                value={formData.endDateTime}
                onChange={handleChange}
                aria-invalid={!!errors.endDateTime}
                aria-describedby={errors.endDateTime ? 'end-error' : undefined}
                required
              />
              {errors.endDateTime && (
                <span id="end-error" className="error-message" role="alert">
                  {errors.endDateTime}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <div className="auto-meet-message">
              <span className="info-icon">ℹ️</span>
              <div className="auto-meet-info">
                <span className="auto-meet-title">Video Conference</span>
                <span>
                  A Google Meet link will be automatically generated for this event. You and your
                  participants will be able to access it from the event details.
                </span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="participants">
              Participants (comma-separated emails)
            </label>
            <input
              type="text"
              id="participants"
              name="participants"
              value={formData.participants}
              onChange={handleChange}
              aria-invalid={!!errors.participants}
              aria-describedby={errors.participants ? 'participants-error' : undefined}
              placeholder="e.g., alice@example.com, bob@example.com"
            />
            {errors.participants && (
              <span id="participants-error" className="error-message" role="alert">
                {errors.participants}
              </span>
            )}
            <small className="form-hint">
              Invitations will be sent to all participants
            </small>
          </div>

          {participantEmails.length > 0 && formData.startDateTime && formData.endDateTime && (
            <div className="availability-check-section">
              <button
                type="button"
                className={`btn btn-check-availability ${showAvailabilityCheck ? 'active' : ''}`}
                onClick={() => setShowAvailabilityCheck(!showAvailabilityCheck)}
                disabled={availabilityLoading}
              >
                {availabilityLoading ? (
                  <>
                    <span className="spinner" />
                    Checking availability...
                  </>
                ) : showAvailabilityCheck ? (
                  '✓ Checking availability'
                ) : (
                  '📋 Check Availability'
                )}
              </button>
              <small className="form-hint">
                Click to check if participants are available at this time
              </small>
            </div>
          )}

          {showAvailabilityCheck && participantEmails.length > 0 && (() => {
            console.log('🎯 EventCreateForm rendering RecipientAvailability with:');
            console.log('  - availabilityData:', availabilityData);
            console.log('  - availabilityData?.availabilities:', availabilityData?.availabilities);
            console.log('  - availabilityLoading:', availabilityLoading);
            console.log('  - availabilityError:', availabilityError);

            return (
              <RecipientAvailability
                availabilities={availabilityData?.availabilities}
                isLoading={availabilityLoading}
                error={availabilityError}
                userTimezone={userTimezone}
              />
            );
          })()}

          <div className="form-timezone-info">
            <small>
              Your timezone: <strong>{Intl.DateTimeFormat().resolvedOptions().timeZone}</strong>
              <br />
              All times are displayed in your local timezone unless specified
            </small>
          </div>
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
            className="btn btn-create-main"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { parseISOString, utcToTimezone } from '../utils/dateTime';
import { cacheEvents, getCachedEvents } from '../utils/indexedDB';

/**
 * Hook to fetch events within a date range
 * Includes both organized events and accepted invitations
 */
export const useEvents = (start, end, options = {}) => {
  const { user } = useAuth();
  // Prefer browser timezone; only use stored user timezone if it's not "UTC"
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const userStoredTimezone = user?.timezone && user.timezone !== 'UTC' ? user.timezone : null;
  const viewerTimezone = userStoredTimezone || browserTimezone;

  return useQuery({
    queryKey: ['events', start?.toISOString(), end?.toISOString(), viewerTimezone],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (start) params.append('start', start.toISOString());
      if (end) params.append('end', end.toISOString());
      params.append('includeInvitations', 'true'); // Add this parameter to include accepted invitations
      // Only add viewerTimezone param if it's not UTC (header will be used instead)
      if (viewerTimezone && viewerTimezone !== 'UTC') {
        params.append('viewerTimezone', viewerTimezone);
      }

      try {
        // Use backend-side filtering if available (with the newer API that includes invitations)
        let events = [];
        try {
          events = await apiClient.get(`/api/v1/events?${params.toString()}`);
        } catch (err) {
          // If the backend doesn't support the includeInvitations parameter,
          // fall back to the client-side filtering approach
          const fallbackParams = new URLSearchParams(params);
          fallbackParams.delete('includeInvitations');
          
          // Fetch events where user is the organizer
          events = await apiClient.get(`/api/v1/events?${fallbackParams.toString()}`);
          
          // Also fetch accepted invitations within the date range
          const invitations = await apiClient.get(`/api/v1/invitations?status=ACCEPTED`);
          
          // Filter invitations for the date range if needed
          const relevantInvitations = invitations.filter(invitation => {
            if (!invitation.event) return false;
            
            const eventStart = new Date(invitation.event.startDateTime);
            const eventEnd = new Date(invitation.event.endDateTime);
            
            // Check if the invitation's event falls within our date range
            return (!start || eventEnd >= start) && (!end || eventStart <= end);
          });
          
          // Get the event data from each accepted invitation
          const invitedEvents = relevantInvitations
            .map(invitation => invitation.event)
            .filter(event => event); // Filter out any null/undefined events
          
          // Combine organized events and events from accepted invitations
          // Add a source field to differentiate them
          events = [
            ...events.map(event => ({ ...event, source: 'organized' })),
            ...invitedEvents.map(event => ({ ...event, source: 'invited' }))
          ];
        }
        
        // Convert UTC times to user's timezone for display
        const processedEvents = events.map((event) => {
          const organizerTimezone = event.timezone || 'UTC';
          const eventViewerTimezone = event.viewerTimezone || viewerTimezone;
          const startLocal = event.startDateTimeLocalized
            ? parseISOString(event.startDateTimeLocalized)
            : utcToTimezone(event.startDateTime, eventViewerTimezone);
          const endLocal = event.endDateTimeLocalized
            ? parseISOString(event.endDateTimeLocalized)
            : utcToTimezone(event.endDateTime, eventViewerTimezone);
          
          return {
            ...event,
            startDateTimeUtc: event.startDateTime,
            endDateTimeUtc: event.endDateTime,
            startDateTime: parseISOString(event.startDateTime),
            endDateTime: parseISOString(event.endDateTime),
            startLocal: startLocal,
            endLocal: endLocal,
            // Add flag to indicate timezone difference
            isDifferentTimezone: organizerTimezone !== eventViewerTimezone,
            // Make sure userTimezone is added to the event object for reference
            userTimezone: eventViewerTimezone,
            viewerTimezone: eventViewerTimezone,
            startDateTimeLocalized: event.startDateTimeLocalized,
            endDateTimeLocalized: event.endDateTimeLocalized,
            originalTimezone: organizerTimezone,
          };
        });

        // Cache events in IndexedDB for offline access
        if (start && end) {
          await cacheEvents(processedEvents, start, end);
        }

        return processedEvents;
      } catch (error) {
        // If network fails, try to get cached events
        console.warn('Failed to fetch events from API, trying cache:', error);
        
        if (start && end) {
          const cachedEvents = await getCachedEvents(start, end);
          if (cachedEvents.length > 0) {
            return cachedEvents;
          }
        }
        
        throw error;
      }
    },
    enabled: !!start && !!end,
    staleTime: 1 * 60 * 1000, // 1 minute (reduced to update more frequently)
    cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    retry: 1,
    ...options,
  });
};

/**
 * Hook to fetch events for a specific day
 */
export const useEventsByDay = (date, options = {}) => {
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  return useQuery({
    queryKey: ['events', 'day', date?.toISOString(), browserTimezone],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (date) params.append('day', date.toISOString().split('T')[0]);
      // Only add header, let it be sent automatically by the client
      // params.append('viewerTimezone', browserTimezone);

      return apiClient.get(`/api/v1/events?${params.toString()}`);
    },
    enabled: !!date,
    ...options,
  });
};

/**
 * Hook to fetch events for a specific week
 */
export const useEventsByWeek = (date, options = {}) => {
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  return useQuery({
    queryKey: ['events', 'week', date?.toISOString(), browserTimezone],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (date) params.append('week', date.toISOString().split('T')[0]);
      // Only add header, let it be sent automatically by the client
      // params.append('viewerTimezone', browserTimezone);

      return apiClient.get(`/api/v1/events?${params.toString()}`);
    },
    enabled: !!date,
    ...options,
  });
};

/**
 * Hook to fetch a single event by ID
 */
export const useEvent = (eventId, options = {}) => {
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  return useQuery({
    queryKey: ['events', eventId, browserTimezone],
    queryFn: () => apiClient.get(`/api/v1/events/${eventId}`), // Header will be sent automatically
    enabled: !!eventId,
    ...options,
  });
};

/**
 * Hook to create a new event
 */
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventData) => apiClient.post('/api/v1/events', eventData),
    onSuccess: () => {
      // Invalidate and refetch events
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

/**
 * Hook to update an existing event
 */
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, eventData }) =>
      apiClient.patch(`/api/v1/events/${eventId}`, eventData),
    onSuccess: (data, variables) => {
      // Invalidate event lists and the specific event
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.setQueryData(['events', variables.eventId], data);
    },
  });
};

/**
 * Hook to delete an event
 */
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId) => apiClient.delete(`/api/v1/events/${eventId}`),
    onSuccess: () => {
      // Invalidate all event queries
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

/**
 * Hook for creating a new event
 * Uses TanStack Query mutation for optimistic updates and cache invalidation
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData) => {
      return apiClient.post('/api/v1/events', eventData);
    },
    onSuccess: () => {
      // Invalidate all event queries to refetch
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Error creating event:', error);
      throw error;
    },
  });
}

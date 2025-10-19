import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';

/**
 * Hook to request meeting time suggestions
 * Uses POST /api/v1/availability to find available slots
 */
export function useFindAvailability() {
  return useMutation({
    mutationFn: async (requestData) => {
      try {
        const response = await apiClient.post('/api/v1/availability', requestData);
        
        console.log('✅ Time suggestions response:', response);
        console.log('✅ Suggestions data:', response.data);
        
        return response.data || [];
      } catch (err) {
        console.error('Error finding available times:', err);
        throw new Error(err.response?.data?.message || 'Failed to find available times');
      }
    },
    retry: 1,
  });
}
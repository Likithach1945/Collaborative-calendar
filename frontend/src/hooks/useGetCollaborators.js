import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

/**
 * Hook to fetch suggested collaborators for the current user
 * Returns users they have frequently collaborated with
 * 
 * @returns {Object} Query result with data, isLoading, error
 */
export function useGetCollaborators() {
  return useQuery({
    queryKey: ['collaborators'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/v1/availability/collaborators');
        
        // Handle different response structures
        if (response && response.data) {
          // Check if response.data is the collaborators array directly
          if (Array.isArray(response.data)) {
            return response.data;
          }
          // Check if response.data has a collaborators property
          if (response.data.collaborators && Array.isArray(response.data.collaborators)) {
            return response.data.collaborators;
          }
        }
        
        console.warn('Unexpected response structure:', response);
        return [];
      } catch (error) {
        console.error('Error fetching collaborators:', error);
        throw error; // Let React Query handle the error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: true, // Always enabled
  });
}

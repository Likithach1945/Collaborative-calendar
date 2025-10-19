import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

/**
 * Hook to fetch current user profile
 */
export const useCurrentUser = (options = {}) => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.get('/api/v1/users/me'),
    ...options,
  });
};

/**
 * Hook to update current user profile
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData) => apiClient.patch('/api/v1/users/me', userData),
    onSuccess: (data) => {
      // Update the user cache
      queryClient.setQueryData(['user', 'me'], data);
    },
  });
};

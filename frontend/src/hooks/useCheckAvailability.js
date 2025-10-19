import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

/**
 * Hook to check availability of recipients at a specific time
 * Used during event creation to show conflicts before committing
 */
export function useCheckAvailability(
  participantEmails,
  startDateTime,
  endDateTime,
  enabled = true
) {
  return useQuery({
    queryKey: [
      'recipient-availability',
      participantEmails?.sort().join(','),
      startDateTime?.toISOString(),
      endDateTime?.toISOString(),
    ],
    queryFn: async () => {
      if (!participantEmails || participantEmails.length === 0) {
        return { availabilities: [] };
      }

      if (!startDateTime || !endDateTime) {
        return { availabilities: [] };
      }

      try {
        const response = await apiClient.post('/api/v1/availability/check', {
          participantEmails,
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
        });
        
        console.log('✅ Availability check response:', response);
        console.log('✅ Response.data:', response.data);
        console.log('✅ Response.data.availabilities:', response.data?.availabilities);
        
        // API returns { availabilities: [...] }
        const result = response.data || response;
        console.log('✅ Final result returned to component:', result);
        return result;
      } catch (err) {
        console.error('Error checking recipient availability:', err);
        throw err;
      }
    },
    enabled: enabled && 
            participantEmails && 
            participantEmails.length > 0 && 
            !!startDateTime && 
            !!endDateTime,
    staleTime: 1000 * 60, // 1 minute
    retry: 1,
  });
}

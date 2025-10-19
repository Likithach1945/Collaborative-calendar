/**
 * Utility functions for timezone detection and management
 */
import { apiClient } from '../api/client';

/**
 * Update user timezone to match the browser's timezone
 */
export const updateUserTimezoneToMatch = async (user) => {
  try {
    // Get the browser's detected timezone
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Check if user timezone is different from browser
    if (user?.timezone && user.timezone === browserTimezone) {
      console.log('🌍 User timezone already matches browser timezone');
      return;
    }
    
    console.log(`🌍 Updating user timezone from ${user?.timezone} to ${browserTimezone}`);
    
    // Update the user's timezone through the API
    await apiClient.patch('/api/v1/users/me', { 
      timezone: browserTimezone 
    });
    
    console.log('🌍 User timezone updated successfully');
    
    // Also update in local storage if that's being used
    if (localStorage.getItem('user')) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      storedUser.timezone = browserTimezone;
      localStorage.setItem('user', JSON.stringify(storedUser));
      console.log('🌍 Updated timezone in localStorage');
    }
  } catch (error) {
    console.error('🌍 Failed to update user timezone:', error);
  }
};

/**
 * Update user timezone to a specific IANA timezone
 * This can be used for testing different timezones
 */
export const setUserTimezone = async (timezone) => {
  try {
    console.log(`🌍 Setting user timezone to ${timezone}`);
    
    // Update the user's timezone through the API
    await apiClient.patch('/api/v1/users/me', { timezone });
    
    console.log('🌍 User timezone updated successfully');
    
    // Also update in local storage if that's being used
    if (localStorage.getItem('user')) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      storedUser.timezone = timezone;
      localStorage.setItem('user', JSON.stringify(storedUser));
      console.log('🌍 Updated timezone in localStorage');
    }
    
    // Reload the page to apply the timezone change
    window.location.reload();
  } catch (error) {
    console.error('🌍 Failed to update user timezone:', error);
  }
};

/**
 * For testing: Reset to browser timezone
 */
export const resetToSystemTimezone = () => {
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return setUserTimezone(browserTimezone);
};
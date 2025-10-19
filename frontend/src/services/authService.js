import { apiClient } from '../api/client';

export const authService = {
  // Initialize login with Google
  loginWithGoogle() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8443';
    window.location.href = `${apiUrl}/oauth2/authorization/google`;
  },

  // Process authentication callback
  processCallback(params) {
    const { token, userId, email, displayName, timezone } = params;
    
    if (!token || !userId || !email) {
      throw new Error('Invalid authentication data');
    }

    const user = {
      id: userId,
      email,
      displayName: displayName || email,
      timezone: timezone || 'UTC'
    };

    return {
      token,
      user
    };
  },

  // Check if the user is authenticated with a valid session
  async validateToken(token) {
    try {
      const response = await apiClient.get('/auth/validate', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.valid;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  // Get the current user's data
  async getCurrentUser(token) {
    try {
      return await apiClient.get('/users/current', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }
};
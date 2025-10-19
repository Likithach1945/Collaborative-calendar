const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8443';

export const apiClient = {
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  async post(endpoint, data, options = {}) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  async patch(endpoint, data, options = {}) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },

  async request(endpoint, options = {}) {
    const { 
      retries = 0, 
      maxRetries = 2, 
      retryDelay = 1000,
      ...fetchOptions 
    } = options;
    
    const token = localStorage.getItem('auth_token');
    
    // Add leading slash if missing
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }

    // Ensure endpoint starts with /api/v1/
    if (!endpoint.startsWith('/api/v1/')) {
      endpoint = '/api/v1' + endpoint;
    }
    
    const isFormDataBody = fetchOptions.body instanceof FormData;

    const headers = {
      ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    };

    if (!headers['X-User-Timezone']) {
      let requesterTimezone = null;
      try {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          requesterTimezone = parsedUser?.timezone;
        }
      } catch (error) {
        console.warn('Failed to read stored user for timezone detection:', error);
      }

      if (!requesterTimezone) {
        try {
          requesterTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (error) {
          requesterTimezone = 'UTC';
        }
      }

      if (requesterTimezone) {
        headers['X-User-Timezone'] = requesterTimezone;
      }
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      if (!response.ok) {
        // Try to parse error response
        const errorData = await response.json().catch(() => ({
          error: 'An error occurred',
          message: `HTTP ${response.status} ${response.statusText}`
        }));
        
        console.error(`API Error (${response.status}):`, errorData);
        
        // Handle specific backend error formats
        let errorMessage = errorData.message || `HTTP ${response.status}`;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map(err => err.defaultMessage || err.message).join(', ');
        }
        
        // Throw structured error object
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = errorData;
        
        // For server errors that might be transient, retry the request
        if (response.status >= 500 && retries < maxRetries) {
          console.warn(`Retrying request due to server error (${retries + 1}/${maxRetries}): ${endpoint}`);
          
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, retries);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.request(endpoint, { 
            ...options, 
            retries: retries + 1,
            maxRetries,
            retryDelay
          });
        }
        
        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      // Try to parse JSON response safely
      try {
        return await response.json();
      } catch (parseError) {
        console.warn('Failed to parse JSON response:', parseError);
        return { message: 'Response was not valid JSON', rawText: await response.text() };
      }
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      
      // For network errors that might be transient, retry the request
      if (!error.status && retries < maxRetries) {
        console.warn(`Retrying request due to network error (${retries + 1}/${maxRetries}): ${endpoint}`);
        
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, retries);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.request(endpoint, { 
          ...options, 
          retries: retries + 1,
          maxRetries,
          retryDelay
        });
      }
      
      throw error;
    }
  },
};

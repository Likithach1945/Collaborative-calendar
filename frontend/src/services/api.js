const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8443';

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Export as default for compatibility
export default {
  get: (endpoint, options) => fetchWithAuth(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options) => fetchWithAuth(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
  patch: (endpoint, data, options) => fetchWithAuth(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) }),
  delete: (endpoint, options) => fetchWithAuth(endpoint, { ...options, method: 'DELETE' }),
};

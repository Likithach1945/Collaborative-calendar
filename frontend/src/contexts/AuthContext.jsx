import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  
  // Debug logging for timezone detection
  useEffect(() => {
    console.log('💡 Browser detected timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log('💡 Current date with timezone:', new Date().toString());
  }, []);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('🔄 Auth - Loaded user from localStorage:', parsedUser);
        console.log('🔄 Auth - User timezone from storage:', parsedUser?.timezone);
        console.log('🔄 Auth - Browser timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (authSession) => {
    const { token, user } = authSession;
    console.log('🔑 Login - User object:', user);
    console.log('🔑 Login - User timezone:', user?.timezone);
    console.log('🔑 Login - Browser timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
    
    setToken(token);
    setUser(user);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // Function to refetch and update user data
  const refetchUser = async () => {
    try {
      setIsRefetching(true);
      
      // Call the API to get updated user data
      const response = await fetch('/api/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const updatedUser = await response.json();
      console.log('🔄 Auth - Updated user data:', updatedUser);
      
      // Update state and localStorage
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('Error refetching user:', error);
      throw error;
    } finally {
      setIsRefetching(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    refetchUser,
    isRefetching
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

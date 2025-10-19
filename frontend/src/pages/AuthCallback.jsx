import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get parameters from URL
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');
        const email = searchParams.get('email');
        const displayName = searchParams.get('displayName');
        const timezone = searchParams.get('timezone');
        
        if (!token || !userId || !email) {
          throw new Error('Authentication failed: Missing required fields');
        }
        
        // Process the authentication data
        const authData = authService.processCallback({ token, userId, email, displayName, timezone });
        
        // Login the user
        login(authData);
        
        // Redirect to calendar page
        navigate('/');
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err.message || 'Authentication failed');
      }
    };

    processAuth();
  }, [searchParams, login, navigate]);

  if (error) {
    return (
      <div className="auth-callback-error">
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Return to Home</button>
      </div>
    );
  }

  return (
    <div className="auth-callback-loading">
      <h2>Authenticating...</h2>
      <p>Please wait while we complete the authentication process.</p>
    </div>
  );
};

export default AuthCallback;
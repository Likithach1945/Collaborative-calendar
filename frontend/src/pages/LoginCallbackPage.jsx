import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginCallbackPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // The backend will handle the OAuth callback and return an AuthSession
        // In a real implementation, the backend would redirect here with the token
        // For now, we'll fetch it from the current session
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8443'}/auth/callback/google`, {
          method: 'GET',
          credentials: 'include', // Include cookies
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const authSession = await response.json();
        login(authSession);
        navigate('/calendar');
      } catch (err) {
        console.error('Login callback error:', err);
        setError(err.message);
      }
    };

    handleCallback();
  }, [login, navigate]);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <h1>Authentication Error</h1>
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>Back to Login</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p>Completing authentication...</p>
    </div>
  );
};

export default LoginCallbackPage;

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    // Use our auth service to initiate Google login
    authService.loginWithGoogle();
  };

  // TEMPORARY: Test login without Google OAuth - just simulate authentication
  const { login } = useAuth();

  const handleTestLogin = () => {
    // Create a fake test user and token
    const testUser = {
      id: "test-user-id",
      email: 'test@example.com',
      displayName: 'Test User',
      timezone: 'UTC'
    };
    const testToken = 'test-token-123456'; // Fake token for testing
    
    // Use our auth context to login
    login({
      token: testToken,
      user: testUser
    });
    
    // Redirect to calendar
    navigate('/');
  };

  if (isAuthenticated()) {
    window.location.href = '/calendar';
    return null;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Calendar Application</h1>
        <p className="login-description">
          Sign in to manage your calendar and events
        </p>
        
        <button 
          className="google-login-button"
          onClick={handleLogin}
        >
          <span className="google-icon">G</span>
          Sign in with Google
        </button>
        
        {/* TEMPORARY: Test login button */}
        <div className="test-login-section">
          <p className="test-login-message">
            <strong>Development Mode:</strong> Test without Google OAuth
          </p>
          <button 
            className="test-login-button"
            onClick={handleTestLogin}
          >
            🧪 Test Login (No Google Required)
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

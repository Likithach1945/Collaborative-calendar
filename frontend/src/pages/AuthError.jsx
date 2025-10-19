import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthError = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const errorMessage = searchParams.get('message') || 'Authentication failed. Please try again.';

  return (
    <div className="auth-error-container">
      <div className="auth-error-card">
        <h1>Authentication Error</h1>
        <p>{errorMessage}</p>
        <button 
          className="primary-button"
          onClick={() => navigate('/')}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default AuthError;
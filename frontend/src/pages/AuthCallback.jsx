import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

/**
 * Component to handle OAuth callback from Google
 * Extracts the auth code and exchanges it for access tokens
 */
const AuthCallback = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      // Extract code from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        console.error('Error from OAuth provider:', error);
        setError('Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      if (!code) {
        setError('No authentication code received');
        setLoading(false);
        return;
      }

      try {
        // Exchange code for token
        const response = await api.post('/auth/google/callback/', {
          code,
          state
        });

        if (response.data && response.data.access) {
          // Store tokens
          localStorage.setItem('token', response.data.access);
          localStorage.setItem('refreshToken', response.data.refresh);
          
          // Store user data if available
          if (response.data.user) {
            localStorage.setItem('username', response.data.user.username);
            localStorage.setItem('email', response.data.user.email);
            localStorage.setItem('user_id', response.data.user.id);
          }

          // Redirect to home or dashboard
          navigate('/dashboard');
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error('Error during auth callback:', err);
        setError('Failed to complete authentication. Please try again.');
        setLoading(false);
      }
    };

    handleAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 max-w-md w-full bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Authenticating...</h2>
          <p className="text-gray-600 mt-2">Please wait while we complete your login.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 max-w-md w-full bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-600">Authentication Error</h2>
          <p className="text-gray-700 mt-2">{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;

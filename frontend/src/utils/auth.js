import api from './api';

const AuthService = {    
    // Login and store token in localStorage
    login: async (username, password, rememberMe = false) => {
        try {
            console.log(`Attempting login for user: ${username}`);
            
            const response = await api.post('/auth/login/', { 
                username, 
                password,
                remember_me: rememberMe
            });
            
            console.log('Login response:', response.data);
            
            // Check if 2FA is required
            if (response.data.two_factor_required) {
                console.log('2FA required for user:', username);
                return {
                    require2FA: true,
                    userId: response.data.user_id,
                    message: 'Two-factor authentication is required.'
                };
            }
            
            // Normal login flow
            if (response.data.access) {
                console.log('Login successful for user:', username);
                localStorage.setItem('token', response.data.access);
                localStorage.setItem('refreshToken', response.data.refresh);
                localStorage.setItem('username', response.data.user?.username || username);
                localStorage.setItem('user_id', response.data.user?.id);
                
                // Store additional user data if available
                if (response.data.user) {
                    localStorage.setItem('email', response.data.user.email || '');
                    localStorage.setItem('profile_picture', response.data.user.profile_picture || '');
                }
                
                return true;
            }
            console.log('Login failed - no access token returned');
            return false;
        } catch (error) {
            console.error('Login error:', error);
            
            // Add detailed error information for debugging
            if (error.response) {
                console.error('Server response error:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Request setup error:', error.message);
            }
            
            // Check for network errors
            if (!error.response) {
                error.response = { data: { detail: 'Network error. Server may be down.' } };
            }
            throw error;        }
    },    
    
    // Register a new user
    register: async (userData) => {
        try {
            console.log('Registering user with data:', userData);
            // Make API request to register endpoint
            // The api instance already includes '/api' as the baseURL
            const response = await api.post('/auth/register/', userData);
            console.log('Registration response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            // Check for network errors
            if (!error.response) {
                error.response = { data: { detail: 'Network error. Server may be down.' } };
            }
            throw error;
        }
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
    },

    // Get current user token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Get current user refresh token
    getRefreshToken: () => {
        return localStorage.getItem('refreshToken');
    },

    // Get current username
    getUsername: () => {
        return localStorage.getItem('username');
    },

    // Check if user is logged in
    isLoggedIn: () => {
        return !!localStorage.getItem('token');
    },

    // Refresh the token
    refreshToken: async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) return false;
              const response = await api.post('/auth/token/refresh/', {
                refresh: refreshToken
            });
            
            if (response.data.access) {
                localStorage.setItem('token', response.data.access);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh error:', error);
            return false;
        }
    },

    // Verify 2FA code
    verify2FA: async (userId, code) => {
        try {
            const response = await api.post('/auth/2fa/verify/', { 
                user_id: userId, 
                code 
            });
            
            if (response.data.access) {
                localStorage.setItem('token', response.data.access);
                localStorage.setItem('refreshToken', response.data.refresh);
                
                if (response.data.user) {
                    localStorage.setItem('username', response.data.user.username);
                    localStorage.setItem('user_id', response.data.user.id);
                    localStorage.setItem('email', response.data.user.email || '');
                    localStorage.setItem('profile_picture', response.data.user.profile_picture || '');
                }
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('2FA verification error:', error);
            throw error;
        }
    },

    // Request password reset
    requestPasswordReset: async (email) => {
        try {
            const response = await api.post('/auth/password-reset/request/', { email });
            return response.data;
        } catch (error) {
            console.error('Password reset request error:', error);
            if (!error.response) {
                error.response = { data: { detail: 'Network error. Server may be down.' } };
            }
            throw error;
        }
    },
    
    // Verify reset password token
    verifyResetToken: async (uid, token) => {
        try {
            const response = await api.post('/auth/password-reset/verify-token/', { uid, token });
            return response.data;
        } catch (error) {
            console.error('Reset token verification error:', error);
            if (!error.response) {
                error.response = { data: { detail: 'Network error. Server may be down.' } };
            }
            throw error;
        }
    },
    
    // Reset password with token
    resetPassword: async (uid, token, password) => {
        try {
            const response = await api.post('/auth/password-reset/reset/', { uid, token, password });
            return response.data;
        } catch (error) {
            console.error('Password reset error:', error);
            if (!error.response) {
                error.response = { data: { detail: 'Network error. Server may be down.' } };
            }
            throw error;
        }
    },
};

export default AuthService;

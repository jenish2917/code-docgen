import api from './api';

const AuthService = {
    // Login and store token in localStorage
    login: async (username, password) => {
        try {
            const response = await api.post('/api/auth/login/', { username, password });
            if (response.data.access) {
                localStorage.setItem('token', response.data.access);
                localStorage.setItem('refreshToken', response.data.refresh);
                localStorage.setItem('username', response.data.username || username);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            // Check for network errors
            if (!error.response) {
                error.response = { data: { detail: 'Network error. Server may be down.' } };
            }
            throw error;
        }
    },

    // Register a new user
    register: async (username, password) => {
        try {
            const response = await api.post('/api/auth/register/', { username, password });
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
            
            const response = await api.post('/api/auth/token/refresh/', {
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
    }
};

export default AuthService;

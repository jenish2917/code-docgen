import axios from 'axios';
import logger from './logger';

// Create an axios instance with a base URL
const api = axios.create({
    // For development with Vite proxy, use /api prefix
    baseURL: '/api',
    // Add proper timeout and response type
    timeout: 3600000, // 60 minutes (increased for complex file processing)
    responseType: 'json'
});

// Base URL is configured via Vite proxy

// Intercept requests and add the token
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // If token exists, add it to the headers
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
          // Send the request with authentication
        
        return config;
    },    (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Intercept responses to handle token expiration and other errors
api.interceptors.response.use(    (response) => {
        logger.api(response.config.method?.toUpperCase(), response.config.url, response.status);
        return response;
    },
    (error) => {        // Network errors
        if (!error.response) {
            // Handle network errors silently
        } 
        // If the error is due to an unauthorized status (401)
        else if (error.response.status === 401) {
            // Clear token and redirect to login page
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('username');
            
            // Don't redirect if already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }        // Handle other status codes as needed
        else if (error.response.status === 429) {
            logger.error('Rate limit exceeded:', error.response.data);
        }
        
        return Promise.reject(error);
    }
);

export default api;

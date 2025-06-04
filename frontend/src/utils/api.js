import axios from 'axios';

// Create an axios instance with a base URL
const api = axios.create({
    baseURL: '/',
    // Add proper timeout and response type
    timeout: 30000, // 30 seconds
    responseType: 'json'
});

// Intercept requests and add the token
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // If token exists, add it to the headers
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercept responses to handle token expiration and other errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Network errors
        if (!error.response) {
            console.error('Network Error:', error);
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
        } 
        // Handle other status codes as needed
        else if (error.response.status === 429) {
            console.error('Rate limit exceeded:', error);
        }
        
        return Promise.reject(error);
    }
);

export default api;

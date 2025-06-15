import axios from 'axios';

// Create an axios instance with a base URL
const api = axios.create({
    // For development with Vite proxy, use relative URLs
    baseURL: '/',
    // Add proper timeout and response type
    timeout: 3600000, // 60 minutes (increased for complex file processing)
    responseType: 'json'
});

// Add logging for debugging purposes
console.log('API configured with baseURL:', api.defaults.baseURL);

// Intercept requests and add the token
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // If token exists, add it to the headers
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Log request for debugging
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Intercept responses to handle token expiration and other errors
api.interceptors.response.use(
    (response) => {
        console.log('API Response Success:', response.config.url, response.status);
        return response;
    },
    (error) => {
        // Network errors
        if (!error.response) {
            console.error('API Network Error:', error.message);
            console.error('Request details:', error.config?.baseURL, error.config?.url);
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

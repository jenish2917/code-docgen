import api from '../api';

const GoogleAuthUtils = {
    /**
     * Check if Google OAuth is configured on the backend
     * @returns {Promise<boolean>} True if Google OAuth is configured
     */
    checkGoogleOAuthConfig: async () => {
        try {
            // Try the new path first
            try {
                const response = await api.get('/auth/google/check-config/');
                return response.data.is_configured;
            } catch (err) {
                // If not found, try the alternative path
                if (err.response && err.response.status === 404) {
                    console.log('Falling back to alternative Google config check endpoint');
                    const altResponse = await api.get('/google/check-config/');
                    return altResponse.data.is_configured;
                }
                throw err;
            }
        } catch (error) {
            console.error('Failed to check Google OAuth config:', error);
            return false;
        }
    }
};

export default GoogleAuthUtils;

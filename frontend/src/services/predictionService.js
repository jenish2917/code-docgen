import api from '../utils/api';

/**
 * Service for handling code documentation prediction functionality
 * Using GitHub AI Marketplace models instead of OpenRouter
 */
const predictionService = {
    /**
     * Uploads a file for documentation generation
     * @param {File} file - The file to upload
     * @param {boolean} isZip - Whether the file is a zip archive
     * @returns {Promise} - Promise with the API response
     */    uploadFile: async (file, isZip = false) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const endpoint = isZip ? '/api/upload-project/' : '/api/upload/';
        
        try {
            // First try with a direct fetch to make sure connection is working
            const testResponse = await fetch('/api/ai-status/');
            if (!testResponse.ok) {
                console.error('API status check failed before upload');
                throw new Error('Server connection test failed');
            } else {
                console.log('API connection verified before upload');
            }
            
            return api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Upload progress: ${percentCompleted}%`);
                },
                // Increase timeout for large files
                timeout: 60000 // 60 seconds
            });
        } catch (error) {
            console.error('Error in uploadFile:', error);
            throw error;
        }
    },

    /**
     * Get documentation statistics
     * @returns {Promise} - Promise with the API response
     */
    getStats: async () => {
        return api.get('/api/stats/');
    },

    /**
     * Export documentation to specified format
     * @param {string} content - The content to export
     * @param {string} format - The format to export to (pdf, docx)
     * @returns {Promise} - Promise with the API response
     */
    exportDocumentation: async (content, format) => {
        return api.post('/api/export-docs/create-temp/', {
            content,
            format
        });
    },

    /**
     * Get AI integration status
     * @returns {Promise} - Promise with the API response
     */
    getAIStatus: async () => {
        return api.get('/api/ai-status/');
    }
};

export default predictionService;

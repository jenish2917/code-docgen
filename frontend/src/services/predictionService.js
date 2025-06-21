import api from '../utils/api';

/**
 * Service for handling code documentation prediction functionality
 * Using local Ollama models for free, open-source AI documentation generation
 */
const predictionService = {
    /**
     * Uploads a file for documentation generation
     * @param {File} file - The file to upload
     * @param {boolean} isZip - Whether the file is a zip archive
     * @returns {Promise} - Promise with the API response
     */    uploadFile: async (file, isZip = false) => {        const formData = new FormData();
        formData.append('file', file);        const endpoint = isZip ? '/upload-project/' : '/upload/';        try {
            // First try with an API call to make sure connection is working
            const testResponse = await api.get('/ai-status/');
            if (!testResponse.status === 200) {
                console.error('API status check failed before upload');
                throw new Error('Server connection test failed');
            } else {
                console.log('API connection verified before upload');
            }
              return api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Upload progress: ${percentCompleted}%`);
                },
                // Increase timeout for Ollama processing (can take much longer for complex files)
                timeout: 3600000 // 60 minutes
            });
        } catch (error) {
            console.error('Error in uploadFile:', error);
            throw error;
        }
    },    /**
     * Get documentation statistics
     * @returns {Promise} - Promise with the API response
     */    getStats: async () => {
        return api.get('/stats/');
    },/**
     * Export documentation to specified format
     * @param {string} content - The content to export
     * @param {string} format - The format to export to (pdf, docx)
     * @returns {Promise} - Promise with the API response
     */
    exportDocumentation: async (content, format) => {
        return api.post('/export-docs/create-temp/', {
            content,
            format
        });
    },

    /**
     * Upload multiple individual files for documentation generation
     * @param {File[]} files - Array of files to upload
     * @returns {Promise} - Promise with the API response
     */
    uploadMultipleFiles: async (files) => {
        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append(`files`, file);
        });
          try {
            return api.post('/upload-multiple/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Multiple files upload progress: ${percentCompleted}%`);
                },
                timeout: 3600000 // 60 minutes for multiple files
            });
        } catch (error) {
            console.error('Error in uploadMultipleFiles:', error);
            throw error;
        }
    },

    /**
     * Upload an entire folder for documentation generation
     * @param {File[]} files - Array of files from folder selection
     * @returns {Promise} - Promise with the API response
     */
    uploadFolder: async (files) => {
        const formData = new FormData();
        
        // Add each file with its relative path preserved
        files.forEach((file) => {
            formData.append('folder_files', file);
            // Also send the relative path information
            formData.append('file_paths', file.webkitRelativePath || file.name);
        });        try {
            return api.post('/upload-folder/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Folder upload progress: ${percentCompleted}%`);
                },
                timeout: 3600000 // 60 minutes for folder processing
            });
        } catch (error) {
            console.error('Error in uploadFolder:', error);
            throw error;
        }
    },    /**     * Get AI integration status
     * @returns {Promise} - Promise with the API response
     */
    getAIStatus: async () => {
        return api.get('/ai-status/');
    }
};

export default predictionService;

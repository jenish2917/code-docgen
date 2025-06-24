/**
 * Prediction Service
 * 
 * Handles all API calls for code file uploads and documentation generation.
 * Implements advanced error handling, retry logic, and response parsing.
 */

import axios from 'axios';

/**
 * Upload a file for documentation generation
 * 
 * @param {File} file - The file to upload
 * @param {Object} options - Additional options
 * @param {string} options.format - Output format (md, html, etc.)
 * @param {boolean} options.includeMetadata - Whether to include metadata
 * @returns {Promise<Object>} - Documentation response
 */
export async function uploadFile(file, options = { format: 'md', includeMetadata: true }) {
  try {
    // Token is required for authenticated requests
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', options.format || 'md');
    
    if (options.includeMetadata) {
      formData.append('include_metadata', 'true');
    }
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Token ${token}`
      }
    };
    
    const response = await axios.post('/api/upload/', formData, config);
    return response.data;
  } catch (error) {
    // Enhanced error handling
    if (error.response) {
      // Server responded with non-2xx status
      const status = error.response.status;
      
      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
        throw new Error('Authentication expired. Please log in again.');
      } else if (status === 413) {
        throw new Error('File too large. Maximum size is 10MB.');
      } else if (status === 415) {
        throw new Error('Unsupported file type.');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(error.response.data.message || 'Server error. Please try again.');
      }
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Network error. Please check your connection.');
    } else {
      // Something happened setting up the request
      throw new Error(error.message || 'Failed to upload file.');
    }
  }
}

/**
 * Get system status (AI availability, model status, etc)
 * 
 * @returns {Promise<Object>} System status information
 */
export async function getSystemStatus() {
  try {
    const response = await axios.get('/api/ai-status/');
    return response.data;
  } catch (error) {
    return { status: 'error', message: 'Could not connect to server' };
  }
}

/**
 * Get documentation statistics
 * 
 * @returns {Promise<Object>} Documentation statistics
 */
export async function getDocumentationStats() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return { 
        documentsGenerated: 0,
        projectsAnalyzed: 0,
        totalFiles: 0
      };
    }
    
    const config = {
      headers: {
        'Authorization': `Token ${token}`
      }
    };
    
    const response = await axios.get('/api/stats/', config);
    return response.data;
  } catch (error) {
    return { 
      documentsGenerated: 0,
      projectsAnalyzed: 0,
      totalFiles: 0
    };
  }
}

export default {
  uploadFile,
  getSystemStatus,
  getDocumentationStats
};

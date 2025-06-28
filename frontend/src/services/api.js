// Enhanced API service for React frontend with Ollama integration
// frontend/src/services/api.js

import { useState } from 'react';

// Get API base URL from Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // File upload for documentation generation
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/api/upload/', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  // Enhanced Ollama integration for custom AI documentation
  async generateDocumentationWithOllama(prompt, options = {}) {
    const payload = {
      prompt,
      model: options.model || 'qwen:0.5b',
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
    };

    try {
      const response = await this.request('/api/generate/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return {
        success: true,
        data: response,
        documentation: response.response,
        metadata: {
          model: response.model_used,
          totalDuration: response.total_duration,
          evalCount: response.eval_count,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: error.error_type || 'unknown',
      };
    }
  }

  // Generate documentation from code content
  async generateDocs(filename, codeContent) {
    return this.request('/api/generate-docs/', {
      method: 'POST',
      body: JSON.stringify({
        filename,
        code_content: codeContent,
      }),
    });
  }

  // Export documentation
  async exportDocs(docContent, filename, format = 'pdf') {
    return this.request('/api/export-docs/', {
      method: 'POST',
      body: JSON.stringify({
        doc_content: docContent,
        filename,
        format,
      }),
    });
  }

  // Get AI status
  async getAIStatus() {
    return this.request('/api/ai-status/');
  }

  // Get documentation statistics
  async getStats() {
    return this.request('/api/stats/');
  }

  // List uploaded files
  async getFiles(userId = null) {
    const params = userId ? `?user_id=${userId}` : '';
    return this.request(`/api/files/${params}`);
  }

  // Get documentation list
  async getDocumentationList() {
    return this.request('/api/documentation/');
  }

  // Get specific documentation
  async getDocumentation(docId) {
    return this.request(`/api/documentation/${docId}/`);
  }
}

export default new ApiService();

// React hook for Ollama integration
export const useOllamaGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const generate = async (prompt, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.generateDocumentationWithOllama(prompt, options);
      
      if (response.success) {
        setResult(response);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error, result };
};

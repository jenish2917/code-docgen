import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const AIConfigStatus = () => {
  const [aiStatus, setAiStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAIStatus = async () => {      try {        setIsLoading(true);
        setError(null);
        
        // Simple, direct API call using the configured axios instance
        const response = await api.get('/ai-status/');
        
        setAiStatus(response.data);
        
      } catch (err) {
        console.error('Failed to fetch AI status:', err);
        setError('Unable to connect to backend. Please ensure the Django server is running.');
      } finally {
        setIsLoading(false);
      }
    };    fetchAIStatus();
    
    // Set up periodic refresh every 60 seconds (instead of 30)
    const interval = setInterval(fetchAIStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="text-gray-600 dark:text-gray-400 flex items-center justify-center py-4">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Checking system status...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
        <div className="font-medium">⚠️ Connection Error</div>
        <div className="text-sm mt-1">{error}</div>
        <div className="text-xs mt-2 text-gray-600 dark:text-gray-400">
          💡 Make sure Django server is running: <code>python manage.py runserver 8000</code>
        </div>
      </div>
    );
  }

  if (!aiStatus) {
    return (
      <div className="text-gray-500 dark:text-gray-400 p-3">
        No AI status data available.
      </div>
    );
  }
  // Determine status color and icon
  const isEnabled = aiStatus.status === 'available' || aiStatus.status === 'operational';
  const statusColor = isEnabled 
    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800'
    : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800';
    
  const statusText = isEnabled ? 'Available' : 'Unavailable';
  const statusIcon = isEnabled ? '✅' : '❌';

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
        🤖 AI Integration Status
      </h4>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm ${statusColor}`}>
            <span className="mr-1">{statusIcon}</span>
            {statusText}
          </div>
          
          {aiStatus.intel_deepseek_available && (
            <div className="inline-flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
              🚀 Intel Optimized
            </div>
          )}
        </div>
        
        {/* Provider Information */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700 dark:text-gray-300">Primary Provider:</span>
            <span className="bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded text-blue-700 dark:text-blue-300 font-medium text-sm">
              {aiStatus.primary_provider || aiStatus.provider || 'Unknown'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700 dark:text-gray-300">Model Chain:</span>
            <span className="bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded text-purple-700 dark:text-purple-300 font-medium text-sm">
              {aiStatus.model || 'Unknown'}
            </span>
          </div>
          
          {aiStatus.fallback_provider && (
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">Fallback:</span>
              <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-gray-700 dark:text-gray-300 font-medium text-sm">
                {aiStatus.fallback_provider}
              </span>
            </div>
          )}
        </div>
          {/* Additional Status Info */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div className="flex items-center">
              <span className="text-green-500 mr-1">●</span>
              Documentation Generator Ready
            </div>
            {aiStatus.capabilities && aiStatus.capabilities.length > 0 && (
              <div className="flex items-center">
                <span className="text-blue-500 mr-1">●</span>
                {aiStatus.capabilities.length} Features Available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConfigStatus;

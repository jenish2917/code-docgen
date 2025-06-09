import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const AIConfigStatus = () => {
  const [aiStatus, setAiStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    const fetchAIStatus = async () => {
      try {        
        setIsLoading(true);
        // Add more detailed debugging
        console.log('------------- DEBUG AI STATUS -------------');
        console.log('API Base URL:', api.defaults.baseURL);
        console.log('Full URL being called:', api.defaults.baseURL + 'api/ai-status/');
        console.log('API headers:', api.defaults.headers);
        console.log('Origin URL:', window.location.origin);
        console.log('CORS test will be from:', window.location.origin, 'to: http://localhost:8000/api/ai-status/');
        
        // Try direct fetch first
        try {
          console.log('Testing direct fetch to backend...');
          const directResponse = await fetch('http://localhost:8000/api/ai-status/', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Origin': window.location.origin
            }
          });
          
          if (directResponse.ok) {
            const directData = await directResponse.json();
            console.log('Direct fetch SUCCESS:', directData);
          } else {
            console.error('Direct fetch failed with status:', directResponse.status);
          }
        } catch (directErr) {
          console.error('Direct fetch failed with error:', directErr.message);
        }
        
        // Try proxied fetch
        try {
          console.log('Testing proxied fetch...');
          const proxiedResponse = await fetch('/api/ai-status/');
          
          if (proxiedResponse.ok) {
            const proxiedData = await proxiedResponse.json();
            console.log('Proxied fetch SUCCESS:', proxiedData);
          } else {
            console.error('Proxied fetch failed with status:', proxiedResponse.status);
          }
        } catch (proxyErr) {
          console.error('Proxied fetch failed with error:', proxyErr.message);
        }
        
        console.log('Now trying axios...');
        const response = await api.get('/api/ai-status/');
        console.log('AI status response received:', response.data);
        setAiStatus(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching AI status:', err);
        console.error('Error details:', err.message);
        if (err.response) {
          console.error('Status:', err.response.status);
          console.error('Data:', err.response.data);
        } else if (err.request) {
          console.error('No response received');
          console.error('Request details:', err.request);
        }
        setError('Unable to fetch AI integration status');      } finally {
        setIsLoading(false);
        console.log('------------- END DEBUG -------------');
      }
    };

    fetchAIStatus();
    
    // Set up automatic retry if error occurs
    const retryInterval = setInterval(() => {
      if (error && retryCount < 3) {
        console.log(`Retrying AI status fetch (${retryCount + 1}/3)...`);
        fetchAIStatus();
        setRetryCount(prev => prev + 1);
      } else if (retryCount >= 3) {
        clearInterval(retryInterval);
      }
    }, 5000); // Retry every 5 seconds
    
    return () => clearInterval(retryInterval);
  }, [error, retryCount]);
  if (isLoading) {
    return <div className="text-gray-600 dark:text-gray-400 flex items-center justify-center py-4">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Checking AI integration status...
    </div>;
  }
  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
        {error}
        {retryCount < 3 && (
          <div className="mt-2 text-sm flex items-center">
            <span className="animate-spin mr-2">⟳</span> 
            Retrying connection...
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">AI Integration Status</h4>
      {aiStatus && (
        <div>
          <div className="flex items-center mb-4">
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
              aiStatus.ai_integration === 'enabled' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}>
              {aiStatus.ai_integration === 'enabled' ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 shadow-inner">
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="flex justify-between">
                <span className="font-medium">Provider:</span> 
                <span className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-md text-blue-700 dark:text-blue-300 font-medium">{aiStatus.provider}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Model:</span> 
                <span className="bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-md text-purple-700 dark:text-purple-300 font-medium">{aiStatus.model}</span>
              </p>
            </div>
          </div>
        </div>
      )}
      {!aiStatus && <p className="text-gray-500 dark:text-gray-400">No AI configuration information available.</p>}
    </div>
  );
};

export default AIConfigStatus;

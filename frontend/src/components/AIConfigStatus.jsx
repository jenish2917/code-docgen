import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIConfigStatus = () => {
  const [aiStatus, setAiStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchAIStatus = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/ai-status/');
        setAiStatus(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching AI status:', err);
        setError('Unable to fetch AI integration status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAIStatus();
  }, []);

  if (isLoading) {
    return <div className="ai-status-loader">Checking AI integration status...</div>;
  }

  if (error) {
    return <div className="ai-status-error">{error}</div>;
  }

  return (
    <div className="ai-config-status">
      <h4>AI Integration Status</h4>
      {aiStatus && (
        <div className="ai-status-details">
          <div className={`ai-status-indicator ${aiStatus.ai_integration === 'enabled' ? 'enabled' : 'disabled'}`}>
            {aiStatus.ai_integration === 'enabled' ? 'Enabled' : 'Disabled'}
          </div>
          <div className="ai-status-info">
            <p><strong>Provider:</strong> {aiStatus.provider}</p>
            <p><strong>Model:</strong> {aiStatus.model}</p>
          </div>
        </div>
      )}
      {!aiStatus && <p>No AI configuration information available.</p>}
    </div>
  );
};

export default AIConfigStatus;

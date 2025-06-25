import React from 'react';
import { exportWithBackend } from '../utils/documentConverter';

const ExportButton = ({ content, format, fileName }) => {
  const handleExport = async () => {
    try {
      if (!content) {
        alert('No content available for export');
        return;
      }

      // Use the backend export function
      const result = await exportWithBackend(content, format, fileName);
      
      if (result.success) {
        console.log(`Successfully exported as ${format}: ${result.filename}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      if (error.message.includes('Failed to fetch')) {
        alert('Unable to connect to server. Please ensure the backend is running.');
      } else {
        alert(`Error exporting documentation as ${format.toUpperCase()}: ${error.message}`);
      }
    }
  };

  return (
    <button onClick={handleExport} className="export-button">
      Export as {format.toUpperCase()}
      
      <style jsx>{`
        .export-button {
          padding: 8px 16px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin: 0 5px;
          transition: background-color 0.2s;
        }
        
        .export-button:hover {
          background-color: #0051b3;
        }
      `}</style>
    </button>
  );
};

export default ExportButton;

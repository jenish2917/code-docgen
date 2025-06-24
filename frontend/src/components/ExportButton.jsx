import React from 'react';
import axios from 'axios';

const ExportButton = ({ docPath, format, fileName }) => {
  const handleExport = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/export-docs/', {
        params: {
          doc_path: docPath,
          format: format
        },
        responseType: format === 'pdf' ? 'blob' : 'json'
      });

      if (format === 'pdf') {
        // For PDF, create a blob and download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName.replace(/\.[^/.]+$/, '')}_doc.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        // For HTML and Markdown, handle as text
        const content = response.data.content;
        const fileExtension = format === 'html' ? 'html' : 'md';
        
        const blob = new Blob([content], { 
          type: format === 'html' ? 'text/html' : 'text/markdown' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName.replace(/\.[^/.]+$/, '')}_doc.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Error exporting documentation as ${format.toUpperCase()}`);
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

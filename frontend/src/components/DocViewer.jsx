import React from 'react';

const DocViewer = ({ documentation }) => {
  if (!documentation) {
    return (
      <div className="doc-empty">
        <p>Upload a code file to see documentation here</p>
      </div>
    );
  }

  return (
    <div className="doc-viewer">
      <h3>Generated Documentation</h3>
      <div className="markdown-content">
        <pre>{documentation}</pre>
      </div>
    </div>
  );
};

export default DocViewer;
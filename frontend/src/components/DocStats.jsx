import React from 'react';
import './DocStats.css';

const DocStats = ({ stats }) => {
  if (!stats) {
    return null;
  }

  return (
    <div className="doc-stats">
      <h4>Documentation Stats</h4>
      <div className="stats-container">
        <div className="stat-item">
          <div className="stat-label">AI Generated</div>
          <div className="stat-value">{stats.aiGenerated || 0}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">AST Generated</div>
          <div className="stat-value">{stats.astGenerated || 0}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Files Processed</div>
          <div className="stat-value">{stats.totalFiles || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default DocStats;

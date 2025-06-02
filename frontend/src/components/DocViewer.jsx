import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const DocViewer = ({ documentation, onExport }) => {
  const [collapsedSections, setCollapsedSections] = useState({});
  
  if (!documentation) {
    return (
      <div className="doc-viewer empty-state">
        <p>Upload a code file to generate documentation</p>
        <style jsx>{`
          .doc-viewer.empty-state {
            background: #f9f9f9;
            border-radius: 5px;
            padding: 30px;
            text-align: center;
            color: #666;
          }
        `}</style>
      </div>
    );
  }
  
  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Process the markdown to add collapsible sections
  const processMarkdown = () => {
    // Split the content by headers and process each section
    const lines = documentation.split('\n');
    let processedLines = [];
    let currentSectionId = null;
    let sectionLevel = 0;
    
    lines.forEach(line => {
      // Check if line is a heading
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
      
      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2];
        const sectionId = `section-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
        
        // Close previous section if needed
        if (currentSectionId && sectionLevel >= level) {
          processedLines.push('</div>');
        }
        
        currentSectionId = sectionId;
        sectionLevel = level;
        
        // Add collapsible header
        const isCollapsed = collapsedSections[sectionId];
        processedLines.push(
          `<div class="section-header level-${level}" onClick="toggleSection('${sectionId}')">`,
          `<span class="toggle-icon">${isCollapsed ? '+' : '-'}</span>`,
          line,
          '</div>',
          `<div class="section-content ${isCollapsed ? 'collapsed' : ''}" id="${sectionId}">`
        );
      } else {
        processedLines.push(line);
      }
    });
    
    // Close the last section if any
    if (currentSectionId) {
      processedLines.push('</div>');
    }
    
    return processedLines.join('\n');
  };
  
  return (
    <div className="doc-viewer">
      <div className="doc-toolbar">
        <h3>Documentation</h3>
        <div className="buttons">
          <button 
            className="export-btn"
            onClick={() => onExport('md')}
          >
            Export Markdown
          </button>
          <button 
            className="export-btn"
            onClick={() => onExport('html')}
          >
            Export HTML
          </button>
        </div>
      </div>
      
      <div className="doc-content">
        <ReactMarkdown>{documentation}</ReactMarkdown>
      </div>
      
      <style jsx>{`
        .doc-viewer {
          background: white;
          border: 1px solid #eaeaea;
          border-radius: 5px;
          margin-top: 20px;
        }
        
        .doc-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          border-bottom: 1px solid #eaeaea;
          background: #f9f9f9;
        }
        
        .doc-toolbar h3 {
          margin: 0;
        }
        
        .export-btn {
          background: #0070f3;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          margin-left: 10px;
          cursor: pointer;
        }
        
        .export-btn:hover {
          background: #0051b3;
        }
        
        .doc-content {
          padding: 15px;
          overflow-y: auto;
          max-height: 600px;
        }
        
        /* Markdown styling */
        .doc-content :global(h1) {
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 10px;
        }
        
        .doc-content :global(code) {
          background: #f5f5f5;
          padding: 2px 4px;
          border-radius: 3px;
        }
        
        .doc-content :global(pre) {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          overflow-x: auto;
        }
        
        .doc-content :global(blockquote) {
          border-left: 4px solid #eaeaea;
          padding-left: 15px;
          margin-left: 0;
          color: #666;
        }
        
        /* Collapsible sections */
        .section-header {
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        
        .section-header:hover {
          background: #f5f5f5;
        }
        
        .toggle-icon {
          margin-right: 5px;
          font-weight: bold;
        }
        
        .section-content.collapsed {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default DocViewer;

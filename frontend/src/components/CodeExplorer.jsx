import React, { useState } from 'react';

const CodeExplorer = ({ files = [] }) => {
  const [expandedFolders, setExpandedFolders] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  
  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Build a nested file tree structure from flat file list
  const buildFileTree = (files) => {
    const root = { name: 'root', type: 'folder', children: {}, path: '' };
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = root;
      
      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        const currentPath = parts.slice(0, index + 1).join('/');
        
        if (isFile) {
          // This is a leaf node (file)
          current.children[part] = {
            name: part,
            type: 'file',
            path: currentPath,
            docPath: file.docPath
          };
        } else {
          // This is a directory
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              type: 'folder',
              children: {},
              path: currentPath
            };
          }
          current = current.children[part];
        }
      });
    });
    
    return root;
  };

  const renderFileTree = (node) => {
    if (node.type === 'file') {
      return (
        <div 
          key={node.path} 
          className={`file-item ${selectedFile === node.path ? 'selected' : ''}`}
          onClick={() => setSelectedFile(node.path)}
        >
          <span className="file-icon">📄</span> {node.name}
        </div>
      );
    }
    
    if (node.type === 'folder') {
      const isExpanded = node.path === '' || expandedFolders[node.path];
      const sortedChildren = Object.values(node.children).sort((a, b) => 
        a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1
      );
      
      return (
        <div key={node.path}>
          {node.path !== '' && (
            <div 
              className="folder-item" 
              onClick={() => toggleFolder(node.path)}
            >
              <span className="folder-icon">{isExpanded ? '📂' : '📁'}</span>
              {node.name}
            </div>
          )}
          
          {isExpanded && (
            <div className="folder-contents">
              {sortedChildren.map(child => renderFileTree(child))}
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  const fileTree = buildFileTree(files);
  
  return (
    <div className="code-explorer">
      <h3>Project Files</h3>
      <div className="file-tree">
        {Object.keys(fileTree.children).length === 0 ? (
          <div className="empty-state">Upload files to explore</div>
        ) : (
          renderFileTree(fileTree)
        )}
      </div>
      
      <style jsx>{`
        .code-explorer {
          background: #f5f5f5;
          border-radius: 5px;
          padding: 10px;
          margin-bottom: 20px;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .file-tree {
          font-family: monospace;
        }
        
        .file-item, .folder-item {
          padding: 5px;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: flex;
          align-items: center;
        }
        
        .file-item:hover, .folder-item:hover {
          background: #e3e3e3;
        }
        
        .file-item.selected {
          background: #0070f3;
          color: white;
        }
        
        .folder-contents {
          padding-left: 20px;
        }
        
        .file-icon, .folder-icon {
          margin-right: 5px;
        }
        
        .empty-state {
          color: #999;
          text-align: center;
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

export default CodeExplorer;

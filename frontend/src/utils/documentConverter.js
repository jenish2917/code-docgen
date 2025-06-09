
/**
 * Utility functions for converting documentation between different formats
 */

/**
 * Converts markdown content to HTML
 * @param {string} markdown - Markdown content
 * @returns {string} HTML content
 */
export const markdownToHtml = (markdown) => {
  if (!markdown) return '';
  
  // Basic markdown to HTML conversion
  return markdown
    // Code blocks
    .replace(/```(\w+)?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Headers
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    // Lists
    .replace(/^\s*\- (.*$)/gm, '<ul><li>$1</li></ul>')
    // Line breaks
    .replace(/\n/g, '<br>');
};

/**
 * Wraps HTML content in a complete HTML document with styling
 * @param {string} htmlContent - HTML content to wrap
 * @param {string} title - Document title
 * @returns {string} Complete HTML document
 */
export const wrapInHtmlDocument = (htmlContent, title = 'Generated Documentation') => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      line-height: 1.5;
      margin: 2rem; 
      color: #333;
    }
    h1, h2, h3 { 
      margin-top: 1.5rem;
      color: #1a56db;
    }
    pre { 
      background: #f5f5f5; 
      padding: 1rem; 
      border-radius: 4px; 
      overflow: auto; 
    }
    code { 
      font-family: monospace; 
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">${htmlContent}</div>
</body>
</html>`;
};

/**
 * Creates a downloadable file from content
 * @param {string} content - File content
 * @param {string} filename - Filename with extension
 * @param {string} mimeType - MIME type of the file
 */
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Formats the name for the download file
 * @param {string} baseFilename - Original filename or base name
 * @param {string} extension - File extension without the dot
 * @returns {string} Formatted filename
 */
export const formatFilename = (baseFilename = 'documentation', extension = 'txt') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  return `${baseFilename}_${timestamp}.${extension}`;
};

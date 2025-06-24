
/**
 * Advanced utility functions for converting documentation between different formats
 * Integrates with backend for server-side conversion of complex formats
 */

/**
 * Converts markdown content to HTML with enhanced formatting
 * @param {string} markdown - Markdown content
 * @returns {string} HTML content
 */
export const markdownToHtml = (markdown) => {
  if (!markdown) return '';
  
  let html = markdown;
  
  // Code blocks with syntax highlighting
  html = html.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, language, code) => {
    return `<pre class="code-block"><code class="language-${language || 'text'}">${escapeHtml(code)}</code></pre>`;
  });
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  
  // Headers
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
  html = html.replace(/^##### (.*?)$/gm, '<h5>$1</h5>');
  html = html.replace(/^###### (.*?)$/gm, '<h6>$1</h6>');
  
  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Lists
  const lines = html.split('\n');
  const processedLines = [];
  let inUl = false;
  let inOl = false;
  
  for (const line of lines) {
    // Unordered lists
    if (/^\s*[-*+]\s+/.test(line)) {
      if (!inUl) {
        processedLines.push('<ul>');
        inUl = true;
      }
      if (inOl) {
        processedLines.push('</ol>');
        inOl = false;
      }
      const item = line.replace(/^\s*[-*+]\s+/, '');
      processedLines.push(`<li>${item}</li>`);
    }
    // Ordered lists
    else if (/^\s*\d+\.\s+/.test(line)) {
      if (!inOl) {
        processedLines.push('<ol>');
        inOl = true;
      }
      if (inUl) {
        processedLines.push('</ul>');
        inUl = false;
      }
      const item = line.replace(/^\s*\d+\.\s+/, '');
      processedLines.push(`<li>${item}</li>`);
    }
    else {
      if (inUl) {
        processedLines.push('</ul>');
        inUl = false;
      }
      if (inOl) {
        processedLines.push('</ol>');
        inOl = false;
      }
      if (line.trim()) {
        processedLines.push(`<p>${line}</p>`);
      } else {
        processedLines.push('<br>');
      }
    }
  }
  
  // Close any open lists
  if (inUl) processedLines.push('</ul>');
  if (inOl) processedLines.push('</ol>');
  
  return processedLines.join('\n');
};

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Convert markdown to clean plain text
 * @param {string} markdown - Markdown content
 * @returns {string} Plain text content
 */
export const markdownToPlainText = (markdown) => {
  if (!markdown) return '';
  
  let text = markdown;
  
  // Remove code blocks
  text = text.replace(/```.*?```/gs, '');
  
  // Remove inline code
  text = text.replace(/`([^`]+)`/g, '$1');
  
  // Remove headers formatting
  text = text.replace(/^#{1,6}\s*/gm, '');
  
  // Remove bold and italic
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, '$1');
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/\*(.*?)\*/g, '$1');
  
  // Remove links, keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove list markers
  text = text.replace(/^\s*[-*+]\s+/gm, '• ');
  text = text.replace(/^\s*\d+\.\s+/gm, '');
  
  // Clean up extra whitespace
  text = text.replace(/\n\s*\n/g, '\n\n');
  text = text.trim();
  
  return text;
};

/**
 * Wraps HTML content in a complete HTML document with professional styling
 * @param {string} htmlContent - HTML content to wrap
 * @param {string} title - Document title
 * @returns {string} Complete HTML document
 */
export const wrapInHtmlDocument = (htmlContent, title = 'Generated Documentation') => {
  const timestamp = new Date().toLocaleString();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
      background: #fff;
    }
    
    h1, h2, h3, h4, h5, h6 {
      color: #2d3748;
      margin-top: 2rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }
    
    h1 { font-size: 2.5rem; border-bottom: 3px solid #3182ce; padding-bottom: 0.5rem; }
    h2 { font-size: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3rem; }
    h3 { font-size: 1.5rem; }
    h4 { font-size: 1.25rem; }
    
    p {
      margin-bottom: 1rem;
      text-align: justify;
    }
    
    .code-block {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1rem 0;
      overflow-x: auto;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    
    .inline-code {
      background: #edf2f7;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
    }
    
    ul, ol {
      margin: 1rem 0;
      padding-left: 2rem;
    }
    
    li {
      margin-bottom: 0.5rem;
    }
    
    a {
      color: #3182ce;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    .header {
      text-align: center;
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 3px solid #3182ce;
    }
    
    .footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #718096;
      font-size: 0.9rem;
    }
    
    @media print {
      body { padding: 1rem; }
      .code-block { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p>Generated on ${timestamp}</p>
  </div>
  
  <div class="content">${htmlContent}</div>
  
  <div class="footer">
    <p>Generated by Code Documentation Generator</p>
  </div>
</body>
</html>`;
};

/**
 * Export documentation using backend conversion service
 * @param {string} content - Markdown content to export
 * @param {string} format - Export format (txt, html, md, docx, pdf)
 * @param {string} filename - Base filename
 * @returns {Promise} Promise that resolves when download starts
 */
export const exportWithBackend = async (content, format, filename = 'documentation') => {
  try {
    const response = await fetch('/export-docs/create-temp/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content,
        format: format
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.download_url) {
      // Create download link and trigger download
      const downloadLink = document.createElement('a');
      downloadLink.href = data.download_url;
      downloadLink.download = data.filename || `${filename}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      return { success: true, filename: data.filename };
    } else {
      throw new Error(data.error_message || 'Unknown error occurred');
    }
  } catch (error) {
    console.error('Backend export error:', error);
    throw error;
  }
};

/**
 * Creates a downloadable file from content (client-side)
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

/**
 * Enhanced export function that tries backend first, falls back to client-side
 * @param {string} content - Markdown content to export
 * @param {string} format - Export format
 * @param {string} filename - Base filename
 * @returns {Promise} Export result
 */
export const smartExport = async (content, format, filename = 'documentation') => {
  const supportedServerFormats = ['docx', 'pdf'];
  
  try {
    // Try backend export for complex formats
    if (supportedServerFormats.includes(format)) {
      return await exportWithBackend(content, format, filename);
    }
    
    // Use client-side export for simple formats
    let exportContent = content;
    let mimeType = 'text/plain';
    let finalFilename = formatFilename(filename, format);
    
    switch (format) {
      case 'html':
        exportContent = wrapInHtmlDocument(markdownToHtml(content), filename);
        mimeType = 'text/html';
        break;
      case 'txt':
        exportContent = markdownToPlainText(content);
        mimeType = 'text/plain';
        break;
      case 'md':
        exportContent = content;
        mimeType = 'text/markdown';
        break;
      default:
        exportContent = content;
    }
    
    downloadFile(exportContent, finalFilename, mimeType);
    return { success: true, filename: finalFilename };
      } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

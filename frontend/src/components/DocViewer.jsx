import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeHighlighter from './CodeHighlighter';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const DocViewer = ({ content, generator, isLoading }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const handleExport = async (format) => {
    if (!content) return;
    
    try {
      // For PDF and DOCX formats, we need to use the server-side conversion
      if (format === 'pdf' || format === 'docx') {
        // First we need to save the current content to a temporary file on the server
        // Implement server-side export functionality
        import('../utils/api').then(async (api) => {
          try {
            setIsLoading(true);
            // Create a temporary document on server
            const tempDocResponse = await api.default.post('/api/export-docs/create-temp/', {
              content: content,
              format: format
            });
            
            if (tempDocResponse.data && tempDocResponse.data.download_url) {
              // Create download link and click it
              const downloadLink = document.createElement('a');
              downloadLink.href = tempDocResponse.data.download_url;
              downloadLink.download = `documentation.${format}`;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
              toast.success(`${format.toUpperCase()} document downloaded successfully`);
            } else {
              toast.error(`Failed to generate ${format.toUpperCase()} document`);
            }
          } catch (error) {
            console.error(`Error exporting to ${format}:`, error);
            toast.error(`Error exporting to ${format.toUpperCase()}. Server-side conversion is not yet fully implemented.`);
          } finally {
            setIsLoading(false);
            setShowExportMenu(false);
          }
        });
        return;
      }
    
      // For other formats, use the client-side conversion
      // Import the document converter utilities
      import('../utils/documentConverter.js').then(({
        markdownToHtml,
        wrapInHtmlDocument,
        downloadFile,
        formatFilename
      }) => {
        let exportContent = content;
        let mimeType = 'text/plain';
        let extension = 'txt';
        
        // Format content based on export type
        switch (format) {
          case 'html':
            // Convert markdown to HTML
            const htmlContent = markdownToHtml(content);
            exportContent = wrapInHtmlDocument(htmlContent);
            mimeType = 'text/html';
            extension = 'html';
            break;
          
          case 'md':
            // Keep as markdown
            mimeType = 'text/markdown';
            extension = 'md';
            break;
            
          default:
            // Plain text
            break;
        }
        
        // Create a filename
        const filename = formatFilename('documentation', extension);
        
        // Download the file
        downloadFile(exportContent, filename, mimeType);
        setShowExportMenu(false);
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export document. Please try again.');
      setShowExportMenu(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse">Loading documentation...</div>
      </div>
    );
  }
    if (!content) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Upload a code file to see documentation here</p>
      </div>
    );
  }

  // Custom renderers for markdown with syntax highlighting
  const components = {
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <CodeHighlighter 
          language={match[1]} 
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </CodeHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Generated Documentation</h3>
        <div className="flex items-center gap-2">
          {content && (
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)} 
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                title="Export documentation"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-10 border border-gray-200 dark:border-gray-700">
                  <ul className="py-1">
                    <li>
                      <button
                        onClick={() => handleExport('txt')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Text (.txt)
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleExport('html')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        HTML (.html)
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleExport('md')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Markdown (.md)
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleExport('docx')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Word (.docx)
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        PDF (.pdf)
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {generator && (
            <div 
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                generator === 'deepseek' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                : generator === 'ast' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`} 
              title={`Documentation generated by ${generator}`}
            >
              {generator === 'deepseek' ? '🤖 AI Generated' : 
               generator === 'ast' ? '🧩 AST Parser' : 
               generator === 'error' ? '⚠️ Error' : '🧩 AST Parser'}
            </div>
          )}
        </div>
      </div>
      
      <div className="prose prose-slate dark:prose-invert max-w-full">
        <ReactMarkdown components={components}>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default DocViewer;
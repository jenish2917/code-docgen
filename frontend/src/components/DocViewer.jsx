import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeHighlighter from './CodeHighlighter';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { smartExport } from '../utils/documentConverter';

const DocViewer = ({ content, generator, isLoading: externalIsLoading }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
    const handleExport = async (format) => {
    if (!content) return;
    
    try {
      setIsLoading(true);
      setShowExportMenu(false);
      
      // Use the new smart export function
      const result = await smartExport(content, format, 'documentation');
      
      toast.success(`${format.toUpperCase()} document downloaded successfully: ${result.filename}`);
      
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      toast.error(`Failed to export to ${format.toUpperCase()}. ${error.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };
  if (externalIsLoading || isLoading) {
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
  // Custom renderers for markdown with improved styling and hierarchy
  const components = {
    h1: ({children}) => (
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
        {children}
      </h1>
    ),
    h2: ({children}) => (
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">
        {children}
      </h2>
    ),
    h3: ({children}) => (
      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mt-6 mb-3">
        {children}
      </h3>
    ),
    h4: ({children}) => (
      <h4 className="text-lg font-medium text-gray-600 dark:text-gray-300 mt-4 mb-2">
        {children}
      </h4>
    ),
    p: ({children}) => (
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {children}
      </p>
    ),
    ul: ({children}) => (
      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">
        {children}
      </ul>
    ),
    ol: ({children}) => (
      <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">
        {children}
      </ol>
    ),
    li: ({children}) => (
      <li className="ml-4">{children}</li>
    ),
    blockquote: ({children}) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300">
        {children}
      </blockquote>
    ),
    strong: ({children}) => (
      <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>
    ),
    hr: () => (
      <hr className="my-8 border-gray-200 dark:border-gray-700" />
    ),
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="my-4">
          <CodeHighlighter 
            language={match[1]} 
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </CodeHighlighter>
        </div>
      ) : (
        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-red-600 dark:text-red-400" {...props}>
          {children}
        </code>
      );
    }
  };
    return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Documentation</h3>
        <div className="flex items-center gap-2">
          {generator && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
              {generator === 'AI-Generated' ? '🤖 AI Generated' : 
               generator === 'intel_deepseek' ? '🚀 AI Enhanced' :
               generator === 'ollama' ? '⚡ AI Powered' : 
               generator === 'fallback' ? '📝 Standard' : '✨ Generated'}
            </span>
          )}
          {content && (
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)} 
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm"
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
            {generator && (            <div 
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                generator === 'intel_deepseek'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-300 dark:border-blue-600'                : generator === 'ollama'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                : generator === 'multiple'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                : generator === 'folder'
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                : generator === 'ast' || generator === 'fallback'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`} 
              title={`Documentation generated by ${generator}`}
            >
              {generator === 'intel_deepseek' ? '🚀 Intel DeepSeek' :
               generator === 'ollama' ? '🤖 AI Generated' :
               generator === 'multiple' ? '📚 Multiple Files' :
               generator === 'folder' ? '📁 Folder Analysis' :
               generator === 'ast' || generator === 'fallback' ? '🧩 AST Parser' :
               generator === 'error' ? '⚠️ Error' : '🧩 AST Parser'}
            </div>
          )}
        </div>      </div>      
      <div className="documentation-content bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700
                     text-gray-900 dark:text-gray-100 leading-relaxed max-w-none
                     [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h1]:pb-3 [&>h1]:border-b [&>h1]:border-gray-200 [&>h1]:dark:border-gray-700
                     [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:text-blue-600 [&>h2]:dark:text-blue-400
                     [&>h3]:text-xl [&>h3]:font-medium [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:text-gray-800 [&>h3]:dark:text-gray-200
                     [&>h4]:text-lg [&>h4]:font-medium [&>h4]:mt-4 [&>h4]:mb-2 [&>h4]:text-gray-700 [&>h4]:dark:text-gray-300
                     [&>p]:mb-4 [&>p]:leading-relaxed
                     [&>ul]:mb-4 [&>ul]:space-y-1 [&>ol]:mb-4 [&>ol]:space-y-1
                     [&>li]:ml-4
                     [&>hr]:my-8 [&>hr]:border-gray-200 [&>hr]:dark:border-gray-700">
        <ReactMarkdown components={components}>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default DocViewer;
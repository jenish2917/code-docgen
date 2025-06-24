import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeHighlighter from './CodeHighlighter';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { smartExport } from '../utils/documentConverter';
import { sampleDocumentation, sampleGenerator } from '../data/sampleDocumentation';

const DocViewer = ({ content, generator, isLoading: externalIsLoading }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        <CodeHighlighter language={match[1]} code={String(children).replace(/\n$/, '')} />
      ) : (
        <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
    table: ({children}) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {children}
        </table>
      </div>
    ),
    thead: ({children}) => (
      <thead className="bg-gray-50 dark:bg-gray-800">
        {children}
      </thead>
    ),
    th: ({children}) => (
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({children}) => (
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
        {children}
      </td>
    ),
  };

  const handleExport = async (format) => {
    const contentToExport = content || sampleDocumentation;
    if (!contentToExport) return;
    
    try {
      setIsLoading(true);
      setShowExportMenu(false);
      
      const filename = content ? 'documentation' : 'sample-documentation';
      const result = await smartExport(contentToExport, format, filename);
      
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Sample Documentation</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm px-3 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 font-medium">
                🤖 AI Generated Sample
              </span>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export Sample
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="py-2">
                    {['markdown', 'html', 'txt', 'docx', 'pdf'].map((format) => (
                      <button
                        key={format}
                        onClick={() => handleExport(format)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Export as {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-200/50 dark:border-gray-700/50 max-h-[800px] overflow-y-auto">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown components={components}>
              {sampleDocumentation}
            </ReactMarkdown>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Ready to Generate Your Own Documentation?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload your code files and let our AI generate comprehensive documentation like this sample.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
              Start Generating Documentation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Documentation</h3>
        </div>
        
        <div className="flex items-center gap-3">
          {generator && (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm px-3 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 font-medium">
                {generator === 'AI-Generated' ? '🤖 AI Generated' : 
                 generator === 'Manual' ? '📝 Manual' : 
                 generator}
              </span>
            </div>
          )}
          
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-2">
                  {['markdown', 'html', 'txt', 'docx', 'pdf'].map((format) => (
                    <button
                      key={format}
                      onClick={() => handleExport(format)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Export as {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-200/50 dark:border-gray-700/50 max-h-[800px] overflow-y-auto">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown components={components}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default DocViewer;

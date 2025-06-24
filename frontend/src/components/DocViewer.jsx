import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeHighlighter from './CodeHighlighter';
import { Download, Loader2, FileText, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { smartExport } from '../utils/documentConverter';
import { sampleDocumentation, sampleGenerator } from '../data/sampleDocumentation';

const DocViewer = ({ 
  content, 
  generator, 
  isLoading: externalIsLoading = false,
  title,
  language,
  generatedAt,
  showHeader = true,
  className = ""
}) => {  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Determine if we're showing sample or user-generated content
  const isShowingSample = !content || content.trim() === '';
  const displayContent = isShowingSample ? sampleDocumentation : content;
  const displayGenerator = isShowingSample ? sampleGenerator : generator;
  const displayTitle = isShowingSample ? "Sample Documentation" : (title || "Generated Documentation");

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExportMenu]);

  // Custom renderers for markdown with improved styling and hierarchy
  const components = {
    h1: ({children}) => (
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b-2 border-blue-500 dark:border-blue-400">
        {children}
      </h1>
    ),
    h2: ({children}) => (
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
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
    h5: ({children}) => (
      <h5 className="text-base font-medium text-gray-600 dark:text-gray-300 mt-3 mb-2">
        {children}
      </h5>
    ),
    h6: ({children}) => (
      <h6 className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-2 mb-1">
        {children}
      </h6>
    ),
    p: ({children}) => (
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-justify">
        {children}
      </p>
    ),
    ul: ({children}) => (
      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
        {children}
      </ul>
    ),
    ol: ({children}) => (
      <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
        {children}
      </ol>
    ),
    li: ({children}) => (
      <li className="ml-2">{children}</li>
    ),
    blockquote: ({children}) => (
      <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-6 py-2 my-6 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic rounded-r-lg">
        {children}
      </blockquote>
    ),
    strong: ({children}) => (
      <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>
    ),
    em: ({children}) => (
      <em className="italic text-gray-700 dark:text-gray-300">{children}</em>
    ),
    hr: () => (
      <hr className="my-8 border-t-2 border-gray-200 dark:border-gray-700" />
    ),    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="relative">
          <CodeHighlighter language={match[1]} code={String(children).replace(/\n$/, '')} />
        </div>
      ) : (
        <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono border" {...props}>
          {children}
        </code>
      );
    },
    table: ({children}) => (
      <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200 dark:border-gray-700">
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
    tbody: ({children}) => (
      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </tbody>
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
    a: ({children, href}) => (
      <a href={href} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  };
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Code copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleExport = async (format) => {
    if (!displayContent) return;
    
    try {
      setIsLoading(true);
      setShowExportMenu(false);
      
      const filename = isShowingSample ? 'sample-documentation' : (title ? title.toLowerCase().replace(/\s+/g, '-') : 'documentation');
      const result = await smartExport(displayContent, format, filename);
      
      toast.success(`${format.toUpperCase()} document downloaded successfully: ${result.filename}`);
      
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      toast.error(`Failed to export to ${format.toUpperCase()}. ${error.message || 'Please try again.'}`);    } finally {
      setIsLoading(false);
    }
  };

  const copyFullContent = async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      toast.success('Documentation copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy documentation');
    }
  };

  if (externalIsLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading documentation...</p>
        </div>
      </div>
    );
  }

  const containerClasses = `space-y-6 ${className}`;

  return (
    <div className={containerClasses}>
      {showHeader && (
        <div className="flex justify-between items-start bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                {displayTitle}
                {isShowingSample && <Sparkles className="w-5 h-5 text-yellow-500" />}
              </h3>
              {language && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                    {language}
                  </span>
                  {generatedAt && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Generated on {new Date(generatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
            <div className="flex items-center gap-2">
            {displayGenerator && (
              <span className="text-sm px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 font-medium">
                {isShowingSample ? '✨ Sample' : 
                 displayGenerator === 'AI-Generated' ? '🤖 AI Generated' : 
                 displayGenerator === 'Manual' ? '📝 Manual' : 
                 displayGenerator}
              </span>            )}
            
            <div className="relative export-menu-container">
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
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                    <div className="py-2">
                      {['markdown', 'html', 'txt', 'docx', 'pdf'].map((format) => (
                        <button
                          key={format}
                          onClick={() => handleExport(format)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Export as {format.toUpperCase()}
                        </button>
                      ))}                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-200/50 dark:border-gray-700/50 max-h-[800px] overflow-y-auto">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown components={components}>
            {displayContent}
          </ReactMarkdown>
        </div>
      </div>
      
      {isShowingSample && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/30 dark:to-blue-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700/50">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm mr-3">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Ready to Generate Your Own Documentation?
              </h4>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload your code files to see personalized documentation for your projects.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => window.location.href = '/'}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Start Generating Documentation
              </button>
              <button 
                onClick={() => handleExport('pdf')}
                className="px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Download Sample
              </button>
            </div>
          </div>
        </div>
      )}

      {!isShowingSample && content && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              Documentation successfully generated and ready for use
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocViewer;

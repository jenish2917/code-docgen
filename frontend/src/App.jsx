import { useState, useEffect, useCallback, useMemo } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import UnifiedFileUploader from './components/UnifiedFileUploader'
import DocViewer from './components/DocViewer'
import AIConfigStatus from './components/AIConfigStatus'
import DocStats from './components/DocStats'
import ThemeToggle from './components/ThemeToggle'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import DocumentationView from './pages/DocumentationView'
import AuthService from './utils/auth'
import 'react-toastify/dist/ReactToastify.css'

/**
 * Main Application Component
 * 
 * Features:
 * - Optimized state management with useCallback
 * - Performance improvements with useMemo
 * - Enhanced error handling
 * - Statistics tracking
 * 
 * @returns {JSX.Element} Main application layout
 */
function App() {
  const [docs, setDocs] = useState("")
  const [error, setError] = useState(null)
  const [generator, setGenerator] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [currentTip, setCurrentTip] = useState(0)
  const [docStats, setDocStats] = useState({
    documentsGenerated: 0,
    projectsAnalyzed: 0,
    totalFiles: 0
  })

  // Loading steps configuration
  const loadingSteps = [
    { step: 'Analyzing code structure...', icon: '🔍', duration: 2000 },
    { step: 'Extracting functions and classes...', icon: '⚙️', duration: 3000 },
    { step: 'Generating documentation...', icon: '📝', duration: 4000 },
    { step: 'Applying AI enhancements...', icon: '🤖', duration: 3000 },
    { step: 'Finalizing output...', icon: '✨', duration: 2000 }
  ];

  // Fun tips that rotate during loading
  const loadingTips = [
    { text: "Our AI can understand context, generate examples, and create comprehensive documentation in seconds!", icon: "💡" },
    { text: "We support Python, JavaScript, TypeScript, Java, C++, and many more programming languages!", icon: "🌟" },
    { text: "The AI analyzes your code patterns to generate meaningful function descriptions and examples.", icon: "🧠" },
    { text: "Documentation includes parameter details, return values, and usage examples automatically.", icon: "📋" },
    { text: "You can export your documentation in multiple formats: PDF, HTML, Markdown, and more!", icon: "📄" }
  ];

  // Simulate loading progress
  useEffect(() => {
    if (isLoading) {
      setLoadingStep(0);
      setLoadingProgress(0);
      setCurrentTip(0);
      
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      const stepInterval = setInterval(() => {
        setLoadingStep(prev => {
          if (prev >= loadingSteps.length - 1) {
            clearInterval(stepInterval);
            return prev;
          }
          return prev + 1;
        });
      }, 3000);

      // Rotate tips every 4 seconds
      const tipInterval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % loadingTips.length);
      }, 4000);

      return () => {
        clearInterval(progressInterval);
        clearInterval(stepInterval);
        clearInterval(tipInterval);
      };
    }
  }, [isLoading, loadingSteps.length, loadingTips.length]);

  // Memoized stats to prevent unnecessary re-renders
  const memoizedStats = useMemo(() => docStats, [docStats])

  // Optimized upload success handler with useCallback and better error handling
  const handleUploadSuccess = useCallback((data) => {
    setError(null)
    setDocs(data.documentation || data.doc || "")
    setGenerator(data.generator || "AI-Generated")
    setIsLoading(false);
    
    // Performance optimization: Batch state updates to prevent unnecessary re-renders
    setDocStats(prevStats => {
      const newStats = { ...prevStats };
      
      // Handle different response types with better type checking
      if (data.status === 'success') {
        // Single file processing (most common case)
        newStats.totalFiles += 1;
        newStats.documentsGenerated += 1;
        
        // Performance tracking: Monitor cache hits for optimization insights
        // Cache hits improve response time significantly
      } else if (data.generator === 'multiple' || data.generator === 'folder') {
        // For multiple files or folders, use the processed_count if available
        const filesProcessed = data.processed_count || data.total_count || 1;
        newStats.totalFiles += filesProcessed;
        newStats.projectsAnalyzed += 1;
      }
      
      return newStats;
    });
  }, [])
  
  // Optimized error handler with useCallback
  const handleUploadError = useCallback((message) => {
    setError(message)
    setIsLoading(false)
  }, [])
  
  // Optimized upload start handler with useCallback
  const handleUploadStart = useCallback(() => {
    setIsLoading(true)
  }, [])

  const isAuthenticated = () => {
    return AuthService.isLoggedIn();
  }

  // Main app content
  const MainAppContent = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Modern Gradient Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CodeDocGen
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI-Powered Documentation Generator</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {!isAuthenticated() ? (
                <>
                  <a href="/login" className="px-6 py-2.5 rounded-xl font-medium transition-all text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 duration-200">
                    Login
                  </a>
                  <a href="/signup" className="px-6 py-2.5 rounded-xl font-medium transition-all text-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 duration-200">
                    Sign Up
                  </a>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {AuthService.getUsername() || 'User'}
                    </span>
                  </div>
                  <a href="/dashboard" className="px-6 py-2.5 rounded-xl font-medium transition-all text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 duration-200">
                    Dashboard
                  </a>
                  <button 
                    onClick={() => {
                      AuthService.logout();
                      window.location.reload();
                    }}
                    className="px-4 py-2.5 rounded-xl font-medium transition-all text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-20 pb-20">
        {/* Error Display */}
        {error && (
          <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-1">Upload Error</h3>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
              <button 
                onClick={() => setError(null)} 
                className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                aria-label="Close error message"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Elegant and Welcoming Loading Interface */}
        {isLoading && (
          <div className="fixed inset-0 bg-gradient-to-br from-blue-50/95 via-indigo-50/95 to-purple-50/95 dark:from-gray-900/95 dark:via-blue-900/95 dark:to-indigo-900/95 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 border border-blue-200/30 dark:border-blue-700/30">
              {/* Main Loading Animation */}
              <div className="text-center mb-8">
                <div className="relative mx-auto w-20 h-20 mb-6">
                  {/* Outer rotating ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-800/50"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>
                  
                  {/* Inner pulsing center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-lg"></div>
                  </div>
                  
                  {/* Floating sparkles */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-bounce opacity-80" style={{animationDelay: '0.1s'}}></div>
                  <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce opacity-80" style={{animationDelay: '0.3s'}}></div>
                  <div className="absolute top-1/2 -left-2 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce opacity-80" style={{animationDelay: '0.5s'}}></div>
                </div>
                
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Creating Your Documentation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {loadingSteps[loadingStep]?.step || 'Analyzing your code with AI...'}
                </p>
              </div>

              {/* Elegant Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span className="font-medium">Progress</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{loadingProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${loadingProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Current Step Display */}
              <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-center justify-center space-x-3">
                  <div className="text-2xl animate-float">
                    {loadingSteps[loadingStep]?.icon || '⚡'}
                  </div>
                  <div className="text-center">
                    <div className="text-blue-800 dark:text-blue-200 font-medium text-sm">
                      Step {loadingStep + 1} of {loadingSteps.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Helpful Tips Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-4 border border-indigo-200/50 dark:border-indigo-700/50 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="text-xl mt-0.5 animate-pulse">
                    {loadingTips[currentTip]?.icon || '💡'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-1 text-sm">
                      💡 Pro Tip
                    </h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                      {loadingTips[currentTip]?.text || 'AI is analyzing your code structure and generating comprehensive documentation!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Encouraging Footer */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span className="font-medium">Almost ready! This usually takes 15-30 seconds</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Upload Code</h2>
              </div>
              <UnifiedFileUploader 
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                onUploadStart={handleUploadStart}
                requireAuth={true}
                isAuthenticated={isAuthenticated()}
                loginRedirect="/login"
              />
            </div>
            
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Recent History</h2>
              </div>
              
              <div className="space-y-3">
                {docs ? (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Latest Documentation</span>
                      </div>
                      <span className="text-xs text-blue-600 dark:text-blue-400">{generator}</span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                      Documentation generated successfully
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No documentation generated yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upload code files to see your history</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Documentation Section */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300">
              <DocStats
                documentsGenerated={docStats.documentsGenerated}
                projectsAnalyzed={docStats.projectsAnalyzed}
                totalFiles={docStats.totalFiles}
              />
            </div>
            
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 min-h-[600px]">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Generated Documentation</h2>
              </div>
              <DocViewer 
                content={docs} 
                generator={generator} 
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </main>
      
      {/* Modern Footer */}
      <footer className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CodeDocGen
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Transform your code into beautiful documentation with the power of AI
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              v1.0 - Built with 💙 for developers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!AuthService.isLoggedIn()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Check system dark mode preference on initial load
  useEffect(() => {
    // Check if dark mode preference is stored in local storage
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    
    // Or if system prefers dark mode
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Initialize dark mode based on preference or system setting
    const shouldBeDark = darkModePreference ?? systemPrefersDark;
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  return (
    <BrowserRouter>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" 
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard generatedDocs={docs} generator={generator} />
          </ProtectedRoute>
        } />
        <Route path="/documentation/:docId" element={
          <ProtectedRoute>
            <DocumentationView />
          </ProtectedRoute>
        } />
        <Route path="/" element={<MainAppContent />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
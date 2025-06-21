import { useState, useEffect, useCallback, useMemo } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import FileUploader from './components/FileUploader.jsx'
import DocViewer from './components/DocViewer'
import DocStats from './components/DocStats'
import ThemeToggle from './components/ThemeToggle'
import UserDocumentationHistory from './components/UserDocumentationHistory'
import SampleDocumentation from './components/SampleDocumentation'
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
  const [docStats, setDocStats] = useState({
    documentsGenerated: 0,
    projectsAnalyzed: 0,
    totalFiles: 0
  })

  // Memoized stats to prevent unnecessary re-renders
  const memoizedStats = useMemo(() => docStats, [docStats])
  
  // Optimized upload success handler with useCallback and better error handling
  const handleUploadSuccess = useCallback((data) => {
    setError(null)
    setDocs(data.documentation || data.doc || "")
    setGenerator(data.generator || "AI-Generated")
    setIsLoading(false)
    
    // Performance optimization: Batch state updates to prevent unnecessary re-renders
    setDocStats(prevStats => {
      const newStats = { ...prevStats };
      
      // Handle different response types with better type checking
      if (data.status === 'success') {
        // Single file processing (most common case)
        newStats.totalFiles += 1;
        newStats.documentsGenerated += 1;
        
        // Performance tracking: Log cache hits for optimization insights
        if (data.cache_hit) {
        }
        
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
  
  // Wrap content in Layout component to maintain header across routes
  const Layout = ({ children }) => {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-lg p-5 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <Link to="/">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Code Documentation Generator</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload code files to generate comprehensive documentation with AI assistance</p>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {!isAuthenticated() ? (
                <>
                  <Link to="/login" className="px-4 py-2 rounded-lg font-medium transition-all text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 duration-200">Login</Link>
                  <Link to="/signup" className="px-4 py-2 rounded-lg font-medium transition-all text-sm bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 duration-200">Sign Up</Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Hi, {AuthService.getUsername() || 'User'}
                  </span>
                  <Link to="/dashboard" className="px-4 py-2 rounded-lg font-medium transition-all text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 duration-200">Dashboard</Link>
                  <button 
                    onClick={() => {
                      AuthService.logout();
                      window.location.href = '/'; // Using direct navigation to ensure full app reset after logout
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-all text-sm bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-6">
          {children}
        </main>
        <footer className="mt-12 py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">CodeDocGen v1.0 - AI-Powered Documentation Generator</p>
          </div>
        </footer>
      </div>
    );
  };

  // Main Home Component
  const Home = () => (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-lg shadow-md flex justify-between items-center">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-red-500 hover:text-red-700 dark:hover:text-red-300 text-xl font-bold"
            aria-label="Close error message"
          >
            ×
          </button>
        </div>
      )}
      
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Fast AI Processing...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This should only take a few seconds</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Upload Code</h2>
            <FileUploader 
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              onUploadStart={handleUploadStart}
            />
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Documentation History</h2>
            <UserDocumentationHistory />
          </div>
        </div>
        
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6 hover:shadow-xl transition-shadow duration-300">
            <DocStats
              documentsGenerated={docStats.documentsGenerated}
              projectsAnalyzed={docStats.projectsAnalyzed}
              totalFiles={docStats.totalFiles}
            />
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
            {docs ? (
              <DocViewer 
                content={docs} 
                generator={generator} 
                isLoading={isLoading}
              />
            ) : (
              <SampleDocumentation />
            )}
          </div>
        </div>
      </div>
    </>
  );

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    const isLoggedIn = AuthService.isLoggedIn();
    const location = useLocation();

    if (!isLoggedIn) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
  };

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
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />
        <Route path="/dashboard" element={
          <Layout>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/documentation/:id" element={
          <Layout>
            <DocumentationView />
          </Layout>
        } />
        <Route path="*" element={<Layout><Navigate to="/" replace /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import FileUploader from './components/FileUploader'
import DocViewer from './components/DocViewer'
import AIConfigStatus from './components/AIConfigStatus'
import DocStats from './components/DocStats'
import ThemeToggle from './components/ThemeToggle'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AuthService from './utils/auth'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const [docs, setDocs] = useState("")
  const [error, setError] = useState(null)
  const [generator, setGenerator] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [docStats, setDocStats] = useState({
    aiGenerated: 0,
    astGenerated: 0,
    totalFiles: 0
  })

  const handleUploadSuccess = (data) => {
    setError(null)
    setDocs(data.doc || "")
    setGenerator(data.generator || "")
    setIsLoading(false)
    
    // Update statistics
    if (data.generator) {
      setDocStats(prevStats => {
        const newStats = { ...prevStats };
        newStats.totalFiles += 1;
        
        if (data.generator === 'openrouter') {
          newStats.aiGenerated += 1;
        } else if (data.generator === 'ast') {
          newStats.astGenerated += 1;
        }
        
        return newStats;
      });
    }
  }
  
  const handleUploadError = (message) => {
    setError(message)
    setIsLoading(false)
  }
  
  const handleUploadStart = () => {
    setIsLoading(true)
  }

  const isAuthenticated = () => {
    return AuthService.isLoggedIn();
  }

  // Main app content
  const MainAppContent = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-lg p-5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Code Documentation Generator</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Upload code files to generate comprehensive documentation with AI assistance</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!isAuthenticated() ? (
              <>
                <a href="/login" className="px-4 py-2 rounded-lg font-medium transition-all text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 duration-200">Login</a>
                <a href="/signup" className="px-4 py-2 rounded-lg font-medium transition-all text-sm bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 duration-200">Sign Up</a>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Hi, {AuthService.getUsername() || 'User'}
                </span>
                <a href="/dashboard" className="px-4 py-2 rounded-lg font-medium transition-all text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 duration-200">Dashboard</a>
                <button 
                  onClick={() => {
                    AuthService.logout();
                    window.location.reload();
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
              <p className="text-gray-700 dark:text-gray-300">Processing with DeepSeek AI...</p>
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
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Configuration</h2>
              <AIConfigStatus />
            </div>
          </div>
          
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6 hover:shadow-xl transition-shadow duration-300">
              <DocStats
                aiGenerated={docStats.aiGenerated}
                astGenerated={docStats.astGenerated}
                totalFiles={docStats.totalFiles}
              />
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <DocViewer 
                content={docs} 
                generator={generator} 
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="mt-12 py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">CodeDocGen v1.0 - AI-Powered Documentation Generator</p>
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
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <MainAppContent />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
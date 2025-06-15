import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileCode, Book, Download } from 'lucide-react'
import AuthService from '../utils/auth'
import api from '../utils/api'
import ThemeToggle from '../components/ThemeToggle'

export default function Dashboard() {
  const [user, setUser] = useState(null)  
  const [stats, setStats] = useState({
    filesProcessed: 0,
    documentsGenerated: 0,
    projectsAnalyzed: 0
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (!AuthService.isLoggedIn()) {
      navigate('/login')
      return
    }

    // Get user information from localStorage
    const username = AuthService.getUsername()
    
    // Set user state
    setUser({ username: username || 'Authenticated User' })
    
    // Fetch user stats (in a real app, this would come from an API)
    fetchUserStats()
  }, [navigate])

  const fetchUserStats = async () => {    try {
      // In a real application, this would be an API call
      // For now we'll just simulate some data
      setStats({
        filesProcessed: 5,
        documentsGenerated: 3,
        projectsAnalyzed: 2
      })
    } catch (error) {
      console.error("Error fetching user statistics:", error)
    }
  }

  const handleLogout = () => {
    AuthService.logout()
    navigate('/login')
  }

  const goToUpload = () => {
    navigate('/')
  }

  if (!user) return <div className="flex justify-center items-center h-screen">Loading...</div>
  
  return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Code Documentation Generator</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm text-gray-600 dark:text-gray-300">Welcome, {user.username}</span>
            <button 
              onClick={handleLogout}
              className="text-sm bg-red-600 px-3 py-1 rounded-lg text-white hover:bg-red-700 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button 
            onClick={goToUpload} 
            className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex flex-col items-center justify-center p-8 text-center hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500"
          >
            <FileCode className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Analyze Code</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Upload any code file to generate comprehensive documentation</p>
          </button>
          
          <button 
            onClick={goToUpload} 
            className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex flex-col items-center justify-center p-8 text-center hover:shadow-lg transition-all border-2 border-transparent hover:border-green-500"
          >
            <Book className="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">View Documentation</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Browse through generated documentation for your codebase</p>
          </button>
          
          <button 
            onClick={goToUpload} 
            className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex flex-col items-center justify-center p-8 text-center hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-500"
          >
            <Download className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Export Files</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Download documentation in various formats (TXT, HTML, Markdown, DOCX, PDF)</p>
          </button>
        </div>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Upload Your Code</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You can now upload your code files for documentation generation. We support most programming languages.
          </p>
          
          <div className="mt-6">
            <div 
              onClick={goToUpload}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer"
            >
              <p className="text-gray-500 dark:text-gray-400 mb-4">Drag and drop your code files here, or click to select files</p>              
              <button 
                onClick={goToUpload} 
                className="px-4 py-2 rounded-lg font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center mx-auto gap-2 hover:scale-[1.02]"
              >
                <Upload className="w-4 h-4" />
                Select Files
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Projects</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {stats.filesProcessed > 0 
                ? "Here are your recent documentation projects:" 
                : "You haven't created any projects yet. Upload code to get started."}
            </p>
            {stats.filesProcessed > 0 && (
              <ul className="mt-4 space-y-2">
                <li className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">models.py</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Python</span>
                </li>
                <li className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">auth.js</span>
                  <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">JavaScript</span>
                </li>
              </ul>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Documentation Stats</h3>
            <div className="flex flex-wrap gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Files Processed</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.filesProcessed}</p>
              </div>              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Documents Generated</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.documentsGenerated}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Projects Analyzed</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.projectsAnalyzed}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

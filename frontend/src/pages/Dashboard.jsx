import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileCode, Book, Download, Calendar, Eye, Settings } from 'lucide-react'
import AuthService from '../utils/auth'
import api from '../utils/api'
import ThemeToggle from '../components/ThemeToggle'
import SettingsModal from '../components/SettingsModal'

export default function Dashboard({ generatedDocs = "", generator = "" }) {
  const [user, setUser] = useState(null)  
  const [stats, setStats] = useState({
    total_files: 0,
    total_documentation: 0,
    files_with_documentation: 0,
    language_breakdown: {}
  })
  const [recentFiles, setRecentFiles] = useState([])
  const [recentDocs, setRecentDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
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
    
    // Fetch real data from backend
    fetchDashboardData()
  }, [navigate])
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get current user ID from token
      const currentUserId = AuthService.getUserId();
      
      // Fetch stats from backend for current user only
      const statsResponse = await api.get('/stats/', { 
        params: { user_id: currentUserId }
      })
      if (statsResponse.data.status === 'success') {
        setStats(statsResponse.data.stats)
      }
        // Fetch recent files for current user only
      const filesResponse = await api.get('/files/', {
        params: { user_id: currentUserId }
      })
      if (filesResponse.data.status === 'success') {
        setRecentFiles(filesResponse.data.files.slice(0, 5)) // Get 5 most recent
      }
      
      // We no longer need to fetch documentation here as it's handled by the DocumentationHistory component
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Fallback to default values
      setStats({
        total_files: 0,
        total_documentation: 0,
        files_with_documentation: 0,
        language_breakdown: {}
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    AuthService.logout()
    navigate('/login')
  }
  const goToUpload = () => {
    navigate('/')
  }
  
  const viewDocumentation = (docId) => {
    if (!docId) {
      console.error('No documentation ID provided')
      return
    }
    navigate(`/documentation/${docId}`)
  }

  const getLanguageColor = (language) => {
    const colors = {
      'python': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'javascript': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      'typescript': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'java': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      'cpp': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'c': 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
      'csharp': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'go': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
      'rust': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      'php': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
      'ruby': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    }
    return colors[language.toLowerCase()] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
  }

  if (!user) return <div className="flex justify-center items-center h-screen">Loading...</div>
    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Modern Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {user.username}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <ThemeToggle />
              <div className="flex items-center bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.username}
                </span>
              </div>
              <a href="/" className="px-6 py-2.5 rounded-xl font-medium transition-all text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 duration-200">
                Upload Files
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <button 
            onClick={goToUpload} 
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.02]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Analyze Code</h3>
              <p className="text-gray-600 dark:text-gray-300">Upload code files to generate comprehensive AI-powered documentation</p>
            </div>
          </button>
          
          <button 
            onClick={goToUpload} 
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.02]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Book className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">View Documentation</h3>
              <p className="text-gray-600 dark:text-gray-300">Browse and explore your generated documentation library</p>
            </div>
          </button>
          
          <button 
            onClick={goToUpload} 
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.02]"
          >            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Export Files</h3>
              <p className="text-gray-600 dark:text-gray-300">Download documentation in various formats (PDF, HTML, Markdown)</p>
            </div>
          </button>
        </div>        
        {/* Quick Upload Section */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 mb-12">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Upload Your Code</h2>
              <p className="text-gray-600 dark:text-gray-400">Generate AI-powered documentation for your projects</p>
            </div>
          </div>
          
          <div 
            onClick={goToUpload}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 group"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">Drag and drop your code files here, or click to select files</p>              
            <button 
              onClick={goToUpload} 
              className="px-8 py-3 rounded-2xl font-semibold transition-all bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center justify-center mx-auto gap-3 hover:scale-105 shadow-lg hover:shadow-xl transform active:scale-95"
            >
              <Upload className="w-5 h-5" />
              Select Files
            </button>
          </div>
        </div>

        {/* Statistics and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-3">
                <FileCode className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Recent Files</h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-500 dark:text-gray-400">Loading...</span>
              </div>
            ) : recentFiles.length > 0 ? (
              <div className="space-y-4">
                {recentFiles.map((file) => (
                  <div key={file.id} className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className="text-gray-700 dark:text-gray-300 font-semibold">{file.title}</span>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(file.uploaded_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getLanguageColor(file.language)}`}>
                          {file.language}
                        </span>                        {file.has_documentation && (                          <button
                            onClick={() => {
                              viewDocumentation(file.documentation_id)
                            }}
                            className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCode className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  You haven't uploaded any files yet. Upload code to get started.
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Documentation Stats</h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-500 dark:text-gray-400">Loading...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Files Uploaded</p>
                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.total_files}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/50 rounded-xl flex items-center justify-center">
                        <FileCode className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-2xl border border-green-200/50 dark:border-green-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Documentation Generated</p>
                        <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.total_documentation}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-800/50 rounded-xl flex items-center justify-center">
                        <Book className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>                  </div>
                </div>
                
                {Object.keys(stats.language_breakdown || {}).length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Programming Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(stats.language_breakdown).map(([language, count]) => (
                        <span 
                          key={language}
                          className={`text-sm px-3 py-1 rounded-full font-medium ${getLanguageColor(language)}`}
                        >
                          {language}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}          </div>
        </div>
      </main>
    </div>
  )
}

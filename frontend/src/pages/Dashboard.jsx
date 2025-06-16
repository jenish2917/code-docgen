import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileCode, Book, Download, Calendar, Eye } from 'lucide-react'
import AuthService from '../utils/auth'
import api from '../utils/api'
import ThemeToggle from '../components/ThemeToggle'

export default function Dashboard() {
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
      
      // Fetch stats from backend
      const statsResponse = await api.get('/api/stats/')
      if (statsResponse.data.status === 'success') {
        setStats(statsResponse.data.stats)
      }
      
      // Fetch recent files
      const filesResponse = await api.get('/api/files/')
      if (filesResponse.data.status === 'success') {
        setRecentFiles(filesResponse.data.files.slice(0, 5)) // Get 5 most recent
      }
      
      // Fetch recent documentation
      const docsResponse = await api.get('/api/documentation/')
      if (docsResponse.data.status === 'success') {
        setRecentDocs(docsResponse.data.documentation.slice(0, 5)) // Get 5 most recent
      }
      
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
    // You can create a documentation viewer page
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
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Files</h3>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : recentFiles.length > 0 ? (
              <ul className="space-y-2">
                {recentFiles.map((file) => (
                  <li key={file.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex justify-between items-center">
                    <div className="flex-1">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{file.title}</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getLanguageColor(file.language)}`}>
                        {file.language}
                      </span>
                      {file.has_documentation && (
                        <button
                          onClick={() => viewDocumentation(file.documentation_id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                You haven't uploaded any files yet. Upload code to get started.
              </p>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Documentation Stats</h3>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg flex-1 min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Files Uploaded</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_files}</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg flex-1 min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Documents Generated</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.total_documentation}</p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg flex-1 min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Files with Docs</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.files_with_documentation}</p>
                  </div>
                </div>
                
                {Object.keys(stats.language_breakdown || {}).length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(stats.language_breakdown).map(([language, count]) => (
                        <span 
                          key={language}
                          className={`text-xs px-2 py-1 rounded-full ${getLanguageColor(language)}`}
                        >
                          {language}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {recentDocs.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Documentation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {doc.code_file_title}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${getLanguageColor(doc.code_file_language)}`}>
                      {doc.code_file_language}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {doc.content_preview}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(doc.generated_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => viewDocumentation(doc.id)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

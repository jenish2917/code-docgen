import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, FileCode, Settings } from 'lucide-react'
import api from '../utils/api'
import DocViewer from '../components/DocViewer'
import ThemeToggle from '../components/ThemeToggle'
import SettingsModal from '../components/SettingsModal'
import AuthService from '../utils/auth'

export default function DocumentationView() {
  const { docId } = useParams()
  const navigate = useNavigate()
  const [documentation, setDocumentation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    fetchDocumentation()
  }, [docId])
  const fetchDocumentation = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/documentation/${docId}/`)
      
      if (response.data.status === 'success') {
        setDocumentation(response.data.documentation)
      } else {
        setError('Failed to load documentation')
      }
    } catch (error) {
      console.error('Error fetching documentation:', error)
      setError('Documentation not found')
    } finally {
      setLoading(false)
    }
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
    return colors[language?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Loading Documentation</h3>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we retrieve your documentation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Documentation Not Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Modern Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FileCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Documentation View
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Viewing generated documentation</p>
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
                  {AuthService.getUsername() || 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} /><main className="max-w-7xl mx-auto px-6 py-12">
        {documentation && (
          <>
            {/* Documentation Header */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
                      <FileCode className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                        {documentation.code_file_title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">Generated Documentation</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getLanguageColor(documentation.code_file_language)}`}>
                        {documentation.code_file_language}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Generated on {new Date(documentation.generated_at).toLocaleDateString()}</span>
                    </div>                  </div>
                </div>
              </div>
            </div>

            {/* Documentation Content */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="p-8">
                <DocViewer 
                  content={documentation.content}
                  generator="AI-Generated"
                  isLoading={false}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, FileCode, Download } from 'lucide-react'
import api from '../utils/api'
import DocViewer from '../components/DocViewer'
import ThemeToggle from '../components/ThemeToggle'

export default function DocumentationView() {
  const { docId } = useParams()
  const navigate = useNavigate()
  const [documentation, setDocumentation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading documentation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Documentation View</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {documentation && (
          <>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {documentation.code_file_title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <FileCode className="w-4 h-4" />
                      <span className={`px-2 py-1 rounded-full text-xs ${getLanguageColor(documentation.code_file_language)}`}>
                        {documentation.code_file_language}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Generated on {new Date(documentation.generated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="p-6">
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

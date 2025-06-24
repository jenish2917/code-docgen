import { useState, useEffect } from 'react';
import { Calendar, Eye } from 'lucide-react';
import api from '../utils/api';
import AuthService from '../utils/auth';
import logger from '../utils/logger';

/**
 * DocumentationHistory Component
 * 
 * Displays a user's documentation history with privacy controls.
 * Only authenticated users can see their own documentation history.
 * 
 * @returns {JSX.Element} DocumentationHistory component
 */
const DocumentationHistory = ({ onViewDoc = null }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchDocumentationHistory = async () => {
      if (!AuthService.isLoggedIn()) {
        setError("Please log in to view your documentation history");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get current user ID from token
        const currentUserId = AuthService.getUserId();
        setUserId(currentUserId);
        
        // Fetch only the current user's documentation
        const response = await api.get('/documentation/', { 
          params: { 
            user_id: currentUserId 
          }
        });
        
        if (response.data.status === 'success') {
          setDocuments(response.data.documentation);
          setError(null);
        } else {
          setError(response.data.message || "Failed to load documentation history");
          setDocuments([]);
        }
      } catch (error) {
        logger.error('Error fetching documentation history:', error);
        setError("Could not load your documentation history. Please try again later.");
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentationHistory();
  }, []);

  const handleViewDoc = (docId) => {
    if (onViewDoc) {
      onViewDoc(docId);
    }
  };

  const getLanguageColor = (language) => {
    if (!language) return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    
    const colors = {
      'python': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'javascript': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      'typescript': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'jsx': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      'tsx': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'java': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      'cpp': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'c': 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
      'csharp': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'go': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
      'rust': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      'php': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
      'ruby': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    };
    
    return colors[language.toLowerCase()] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Documentation History</h3>
        <div className="py-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-blue-500 border-gray-300"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Documentation History</h3>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded">
          <p>{error}</p>
          {!AuthService.isLoggedIn() && (
            <a 
              href="/login" 
              className="mt-2 inline-block text-sm text-red-700 dark:text-red-300 underline hover:text-red-800"
            >
              Log in to view your history
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Documentation History</h3>
      {documents.length === 0 ? (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
          <p className="text-gray-500 dark:text-gray-400">You haven't created any documentation yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 truncate">
                  {doc.code_file_title || 'Untitled Document'}
                </h4>
                {doc.code_file_language && (
                  <span className={`text-xs px-2 py-1 rounded-full ${getLanguageColor(doc.code_file_language)}`}>
                    {doc.code_file_language}
                  </span>
                )}
              </div>
              {doc.content_preview && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {doc.content_preview}
                </p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(doc.generated_at || Date.now()).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleViewDoc(doc.id)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentationHistory;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Eye, FileCode } from 'lucide-react';
import api from '../utils/api';
import AuthService from '../utils/auth';

const UserDocumentationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocumentationHistory();
  }, []);

  const fetchDocumentationHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/documentation/');
      
      if (response.data.status === 'success') {
        // Sort by date (newest first)
        const sortedDocs = response.data.documentation.sort(
          (a, b) => new Date(b.generated_at) - new Date(a.generated_at)
        );
        setHistory(sortedDocs);
      }
    } catch (error) {
      console.error('Error fetching documentation history:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDocumentation = (docId) => {
    navigate(`/documentation/${docId}`);
  };

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
    };
    return colors[language?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!AuthService.isLoggedIn()) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Login to View Your Documentation History
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sign in to access your past documentation and manage your generation history.
          </p>
          <button 
            onClick={() => navigate('/login')} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Documentation History</h2>
      
      {history.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            You haven't generated any documentation yet. Upload a code file to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((doc) => (
            <div 
              key={doc.id} 
              className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => viewDocumentation(doc.id)}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                  {doc.code_file_title}
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full ${getLanguageColor(doc.code_file_language)}`}>
                  {doc.code_file_language}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {doc.content_preview || "Documentation generated for this code file."}
              </p>
              
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(doc.generated_at).toLocaleDateString()}
                </div>
                <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDocumentationHistory;

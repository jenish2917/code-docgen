import { useState } from 'react'
import FileUploader from './components/FileUploader'
import CodeExplorer from './components/CodeExplorer'
import DocViewer from './components/DocViewer'
import ExportButton from './components/ExportButton'
import axios from 'axios'
import './App.css'

function App() {
  const [docs, setDocs] = useState("")
  const [files, setFiles] = useState([])
  const [currentFile, setCurrentFile] = useState(null)
  const [docPath, setDocPath] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleUploadSuccess = (data) => {
    setError(null);
    setDocs(data.doc || "");
    
    if (data.doc_path) {
      setDocPath(data.doc_path);
    }
    
    if (data.file_name) {
      const newFile = {
        path: data.file_name,
        docPath: data.doc_path
      };
      setFiles(prev => [...prev, newFile]);
      setCurrentFile(newFile);
    }
  };
  
  const handleUploadError = (message) => {
    setError(message);
    setLoading(false);
  };
  
  const handleExport = async (format) => {
    if (!docPath) {
      setError("No documentation to export");
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/export-docs/', {
        params: {
          doc_path: docPath,
          format: format
        }
      });
      
      // Create a blob and trigger download
      const content = response.data.content;
      const blob = new Blob([content], { 
        type: format === 'html' ? 'text/html' : 'text/markdown'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documentation.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error("Export error:", err);
      setError(`Failed to export as ${format}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>🧠 CodeDocGen - Auto Documentation Generator</h1>
        <p>Upload code files or project folders to generate comprehensive documentation</p>
      </header>
      
      {error && (
        <div className="error-message">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="close-button">×</button>
        </div>
      )}
      
      <div className="main-content">
        <div className="left-panel">
          <FileUploader 
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
          <CodeExplorer files={files} />
        </div>
        
        <div className="right-panel">
          <DocViewer 
            documentation={docs} 
            onExport={handleExport}
          />
        </div>
      </div>
      
      <footer>
        <p>CodeDocGen v1.0 - Automatically generate documentation from your code</p>
      </footer>
    </div>
  )
}

export default App

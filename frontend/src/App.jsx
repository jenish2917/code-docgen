import { useState } from 'react'
import FileUploader from './components/FileUploader'
import DocViewer from './components/DocViewer'
import AIConfigStatus from './components/AIConfigStatus'
import DocStats from './components/DocStats'
import './App.css'

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
        
        if (data.generator === 'deepseek') {
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

  return (
    <div className="app-container">
      <header>
        <h1>🧠 CodeDocGen - Auto Documentation Generator</h1>
        <p>Upload code files to generate comprehensive documentation with AI assistance</p>
      </header>
      
      {error && (
        <div className="error-message">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="close-button">×</button>
        </div>
      )}
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Processing with DeepSeek AI...</p>
        </div>
      )}
      
      <div className="main-content">
        <div className="left-panel">
          <FileUploader 
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            onUploadStart={handleUploadStart}
          />
          <div className="config-section">
            <AIConfigStatus />
            <DocStats stats={docStats} />
          </div>
        </div>
        
        <div className="right-panel">
          <DocViewer documentation={docs} generator={generator} />
        </div>
      </div>
      
      <footer>
        <p>CodeDocGen v1.0 - AI-Powered Documentation Generator</p>
      </footer>
    </div>
  )
}

export default App
import { useState } from 'react'
import FileUploader from './components/FileUploader'
import DocViewer from './components/DocViewer'
import './App.css'

function App() {
  const [docs, setDocs] = useState("")
  const [error, setError] = useState(null)

  const handleUploadSuccess = (data) => {
    setError(null)
    setDocs(data.doc || "")
  }
  
  const handleUploadError = (message) => {
    setError(message)
  }

  return (
    <div className="app-container">
      <header>
        <h1>🧠 CodeDocGen - Auto Documentation Generator</h1>
        <p>Upload code files to generate comprehensive documentation</p>
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
        </div>
        
        <div className="right-panel">
          <DocViewer documentation={docs} />
        </div>
      </div>
      
      <footer>
        <p>CodeDocGen v1.0 - Automatically generate documentation from your code</p>
      </footer>
    </div>
  )
}

export default App
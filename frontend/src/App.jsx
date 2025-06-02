import { useState } from 'react'
import axios from 'axios'

function App() {
  const [file, setFile] = useState(null)
  const [docs, setDocs] = useState("")

  const handleUpload = async () => {
    const formData = new FormData()
    formData.append("file", file)

    const res = await axios.post("http://localhost:8000/api/upload/", formData)
    setDocs(res.data.doc)
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>📄 Auto Documentation Generator</h1>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload & Generate</button>
      <pre style={{ background: "#eee", padding: 10, marginTop: 20 }}>{docs}</pre>
    </div>
  )
}

export default App

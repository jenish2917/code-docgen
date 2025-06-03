import React, { useState } from 'react';
import axios from 'axios';

const FileUploader = ({ onUploadSuccess, onUploadError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      onUploadError("Please select a file first");
      return;
    }

    // Check if it's a Python file
    if (!file.name.endsWith('.py') && !file.name.endsWith('.zip')) {
      onUploadError("Currently only Python (.py) files or ZIP archives are supported");
      return;
    }

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Determine endpoint based on file type
    const endpoint = file.name.endsWith('.zip') 
      ? 'http://localhost:8000/api/upload-project/'
      : 'http://localhost:8000/api/upload/';

    try {
      const response = await axios.post(endpoint, formData);
      onUploadSuccess(response.data);
    } catch (error) {
      console.error("Upload error:", error);
      onUploadError(error.response?.data?.message || "Error uploading the file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="file-uploader">
      <h3>Upload Code File</h3>
      <div className="upload-container">
        <input 
          type="file" 
          onChange={handleFileChange} 
          accept=".py,.zip"
        />
        <button 
          onClick={handleUpload} 
          disabled={isUploading || !file}
        >
          {isUploading ? "Uploading..." : "Upload & Generate Docs"}
        </button>
      </div>
      {isUploading && <div className="loader">Generating documentation...</div>}
    </div>
  );
};

export default FileUploader;
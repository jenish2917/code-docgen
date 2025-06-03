import React, { useState } from 'react';
import axios from 'axios';

const FileUploader = ({ onUploadSuccess, onUploadError, onUploadStart }) => {
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

    console.log("Uploading file:", file.name, file.type, file.size);
    setIsUploading(true);
    if (onUploadStart) onUploadStart();
    
    const formData = new FormData();
    formData.append('file', file);
      // Determine endpoint based on file type
    const endpoint = file.name.endsWith('.zip') 
      ? '/api/upload-project/'
      : '/api/upload/';try {
      console.log("Uploading to endpoint:", endpoint);
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Upload success response:", response.data);
      onUploadSuccess(response.data);
    } catch (error) {
      console.error("Upload error details:", error);
      
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error("Server error response:", error.response.data);
        onUploadError(`Server error: ${error.response.status} - ${error.response?.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        onUploadError("No response from server. Please check if the backend server is running.");
      } else {
        // Something happened in setting up the request
        console.error("Request setup error:", error.message);
        onUploadError(`Error: ${error.message}`);
      }
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
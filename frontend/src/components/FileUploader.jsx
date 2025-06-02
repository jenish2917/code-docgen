import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const FileUploader = ({ onUploadSuccess, onUploadError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    // Validate files
    const validFiles = acceptedFiles.filter(file => 
      file.name.endsWith('.py') || file.name.endsWith('.zip')
    );

    if (validFiles.length === 0) {
      onUploadError("Please upload Python (.py) files or ZIP project folders only");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append('file', file);

        // Determine the appropriate endpoint based on file type
        const endpoint = file.name.endsWith('.zip') 
          ? 'http://localhost:8000/api/upload-project/'
          : 'http://localhost:8000/api/upload/';

        const response = await axios.post(endpoint, formData, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });

        if (response.data) {
          onUploadSuccess(response.data);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      onUploadError(error.response?.data?.message || "Error uploading files");
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'text/x-python': ['.py'],
    }
  });

  return (
    <div className="file-uploader">
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <div>
            <p>Drag &amp; drop Python files or project folders (ZIP) here, or click to select files</p>
            <small>Currently supported: Python (.py) files and project folders (.zip)</small>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
          <span>{uploadProgress}%</span>
        </div>
      )}

      <style jsx>{`
        .file-uploader {
          margin-bottom: 20px;
        }
        
        .dropzone {
          border: 2px dashed #ccc;
          border-radius: 5px;
          padding: 30px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .dropzone:hover, .dropzone.active {
          border-color: #0070f3;
          background-color: rgba(0, 112, 243, 0.05);
        }
        
        .progress-bar-container {
          margin-top: 15px;
          height: 10px;
          background-color: #eee;
          border-radius: 5px;
          position: relative;
        }
        
        .progress-bar {
          height: 100%;
          background-color: #0070f3;
          border-radius: 5px;
          transition: width 0.3s ease;
        }
        
        .progress-bar-container span {
          position: absolute;
          top: -20px;
          right: 0;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default FileUploader;

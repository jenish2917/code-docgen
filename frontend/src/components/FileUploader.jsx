// filepath: d:\code-docgen\frontend\src\components\FileUploader.jsx
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Loader2 } from 'lucide-react';
import api from '../utils/api';
import predictionService from '../services/predictionService';
import { toast } from 'react-toastify';

const FileUploader = ({ onUploadSuccess, onUploadError, onUploadStart }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  
  const onDrop = useCallback(acceptedFiles => {
    // Filter for only supported file types
    const validFiles = acceptedFiles.filter(file => 
      file.name.endsWith('.py') || file.name.endsWith('.zip') || 
      file.name.endsWith('.js') || file.name.endsWith('.jsx') || 
      file.name.endsWith('.ts') || file.name.endsWith('.tsx')
    );
    
    if (validFiles.length < acceptedFiles.length) {
      toast.warning('Some files were skipped. We currently support Python, JavaScript, TypeScript files and ZIP archives.');
    }
    
    setFiles(prev => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/x-python': ['.py'],
      'application/zip': ['.zip'],
      'application/javascript': ['.js', '.jsx'],
      'application/typescript': ['.ts', '.tsx']
    }
  });
  
  const removeFile = (index) => {
    setFiles(files => files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      onUploadError("Please select files first");
      return;
    }

    console.log("Uploading files:", files.map(f => f.name).join(', '));
    setIsUploading(true);
    if (onUploadStart) onUploadStart();
      // Single file upload
    if (files.length === 1) {
      const file = files[0];
      const isZip = file.name.endsWith('.zip');
      
      try {
        console.log("Uploading file:", file.name);
        const response = await predictionService.uploadFile(file, isZip);
        
        console.log("Upload success response:", response.data);
        toast.success(`Successfully uploaded ${file.name}!`);
        
        // Check for partial success status (when documentation was generated with errors)
        if (response.data.status === 'partial_success') {
          console.log("Partial success - documentation had errors but was generated");
          toast.info("Documentation generated with some errors");
          // We still show the documentation but with a generator set to 'error'
          onUploadSuccess(response.data);
        } else {
          onUploadSuccess(response.data);
        }
      } catch (error) {
        console.error("Upload error details:", error);
        toast.error(`Failed to upload ${file.name}`);
        
        if (error.response) {
          // The server responded with a status code outside the 2xx range
          console.error("Server error response:", error.response.data);
          
          // Check if we have a more detailed error message from the DeepSeek integration
          const errorMessage = error.response?.data?.error_message || 
                              error.response?.data?.message || 
                              'Unknown server error';
                              
          onUploadError(`Server error: ${error.response.status} - ${errorMessage}`);        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received:", error.request);
          // First try to verify if the server is actually running
          fetch('http://localhost:8000/api/ai-status/')
            .then(response => {
              if (response.ok) {
                // Server is running but the specific request failed
                onUploadError("Server is running but the upload request failed. Try again or use a smaller file.");
              } else {
                onUploadError("No response from server. Please check if the backend server is running.");
              }
            })
            .catch(() => {
              onUploadError("No response from server. Please check if the backend server is running.");
            });
        } else {
          // Something happened in setting up the request
          console.error("Request setup error:", error.message);
          onUploadError(`Error: ${error.message}`);
        }
      } finally {
        setIsUploading(false);
      }    } else {
      // Handle multiple files upload
      try {
        toast.info("Processing multiple files...");
        // For now, just handle the first file as an example
        // In a real implementation, you would need to handle multiple file uploads
        const file = files[0];
        const isZip = file.name.endsWith('.zip');
        
        const response = await predictionService.uploadFile(file, isZip);
        
        toast.success(`Successfully processed files!`);
        onUploadSuccess(response.data);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to process multiple files");
        onUploadError("Failed to process multiple files");
      } finally {
        setIsUploading(false);
      }
    }
  };
    return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-3">
          <Upload className={`w-12 h-12 ${isDragActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
          {isDragActive ? (
            <p className="text-blue-600 dark:text-blue-400 font-medium">Drop the files here...</p>
          ) : (
            <>
              <p className="text-gray-500 dark:text-gray-400">
                Drag and drop code files here, or click to select files
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Supported formats: .py, .js, .jsx, .ts, .tsx, .zip
              </p>            </>
          )}          <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 shadow-sm hover:shadow flex items-center gap-2 justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-plus">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" x2="12" y1="18" y2="12"/>
              <line x1="9" x2="15" y1="15" y2="15"/>
            </svg>
            Select Files
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Files ({files.length})</h4>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {files.map((file, index) => (
              <div 
                key={`${file.name}-${index}`} 
                className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800/80 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <File className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[260px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <button 
                  onClick={() => removeFile(index)} 
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
        <div className="mt-4 flex justify-center">
        <button 
          onClick={handleUpload}
          disabled={isUploading || files.length === 0}
          className={`flex items-center gap-2 py-2 px-4 rounded-md transition-all 
            ${isUploading 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600 text-white hover:scale-[1.02]'}`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Upload for Documentation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUploader;

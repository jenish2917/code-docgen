import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Folder, FolderOpen } from 'lucide-react';
import api from '../utils/api';
import predictionService from '../services/predictionService';
import { toast } from 'react-toastify';
import ProgressIndicator from './ProgressIndicator';
import logger from '../utils/logger';

// File and folder filtering constants with security enhancements
const IGNORED_FOLDERS = new Set([
  'node_modules', '.next', 'env', 'venv', '.venv', '__pycache__',
  '.git', '.idea', '.vscode', 'dist', 'build', 'coverage', 'out',
  '.DS_Store', '.ipynb_checkpoints', '.pytest_cache', '.mypy_cache',
  '.cache', '.husky', '.parcel-cache', 'target', 'vendor', 'bower_components'
]);

const IGNORED_EXTENSIONS = new Set([
  '.pyc', '.pyo', '.log', '.lock', '.zip', '.rar', '.7z', '.tar', '.gz',
  '.exe', '.dll', '.so', '.bin', '.img', '.db', '.sqlite3', '.sql',
  '.jpg', '.jpeg', '.png', '.svg', '.gif', '.webp', '.ico', '.mp4', '.mp3', '.wav',
  '.pdf', '.docx', '.xlsx', '.pptx', '.ttf', '.woff', '.woff2', '.eot', '.otf',
  '.min.js', '.min.css', '.map'
]);

// Security constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_TOTAL_FILES = 100; // Maximum files in a single upload
const ALLOWED_MIME_TYPES = new Set([
  'text/plain', 'text/javascript', 'application/json', 'text/x-python',
  'application/zip', 'text/x-typescript'
]);

/**
 * Enhanced File Uploader Component with Security & Performance Optimizations
 * 
 * Features:
 * - File size validation (10MB limit per file)
 * - Maximum file count validation (100 files)
 * - MIME type validation
 * - Enhanced error handling
 * - Performance optimizations for large file sets
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onUploadSuccess - Success callback
 * @param {Function} props.onUploadError - Error callback  
 * @param {Function} props.onUploadStart - Upload start callback
 * @returns {JSX.Element} FileUploader component
 */

const FileUploader = ({ onUploadSuccess, onUploadError, onUploadStart }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState('');
  const [progressStep, setProgressStep] = useState(0);
  const [uploadMode, setUploadMode] = useState('files'); // 'files' or 'folder'
  const [currentFileName, setCurrentFileName] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(30);  // Enhanced file drop handler with security validation
  const onDrop = useCallback(acceptedFiles => {
    // Security check: Validate total file count
    if (acceptedFiles.length > MAX_TOTAL_FILES) {
      toast.error(`Too many files selected. Maximum allowed: ${MAX_TOTAL_FILES}`);
      return;
    }

    // Security check: Validate individual file sizes
    const oversizedFiles = acceptedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error(`Some files exceed the 10MB size limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Filter for only supported file types and apply ignore rules
    const validFiles = acceptedFiles.filter(file => {
      if (shouldIgnoreFile(file)) {
        return false;
      }
      return isSupportedFile(file);
    });
    
    if (validFiles.length < acceptedFiles.length) {
      const filteredCount = acceptedFiles.length - validFiles.length;
      toast.warning(`${filteredCount} files were filtered out. We support Python, JavaScript, TypeScript files and exclude common non-source files.`);
    }
    
    if (validFiles.length === 0) {
      toast.error('No valid files found. Please upload supported code files.');
      return;
    }
    
    setFiles(prev => [...prev, ...validFiles]);
  }, []);
  // Helper function to check if a file should be ignored
  const shouldIgnoreFile = (file) => {
    const relativePath = file.webkitRelativePath || file.name;
    const pathParts = relativePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const fileExtension = '.' + fileName.split('.').pop().toLowerCase();
    
    // Check if any folder in the path is ignored
    for (const part of pathParts.slice(0, -1)) { // Exclude the filename
      if (IGNORED_FOLDERS.has(part) || part.startsWith('.')) {
        return true;
      }
    }
    
    // Check if file extension is ignored
    if (IGNORED_EXTENSIONS.has(fileExtension)) {
      return true;
    }
    
    // Check if filename starts with dot (hidden files)
    if (fileName.startsWith('.') && fileName !== '.env') {
      return true;
    }
    
    return false;
  };

  // Helper function to check if file is supported for documentation
  const isSupportedFile = (file) => {
    const fileName = file.name.toLowerCase();
    return fileName.endsWith('.py') || fileName.endsWith('.js') || 
           fileName.endsWith('.jsx') || fileName.endsWith('.ts') || 
           fileName.endsWith('.tsx') || fileName.endsWith('.zip');
  };

  // Handle folder selection
  const handleFolderSelect = async (event) => {
    const allFiles = Array.from(event.target.files);
    
    // Filter out ignored files and folders
    const filteredFiles = allFiles.filter(file => !shouldIgnoreFile(file));
    
    // Only keep supported file types for documentation
    const supportedFiles = filteredFiles.filter(file => 
      file.name.endsWith('.py') || file.name.endsWith('.js') || 
      file.name.endsWith('.jsx') || file.name.endsWith('.ts') || 
      file.name.endsWith('.tsx')
    );
    
    if (supportedFiles.length === 0) {
      toast.warning('No supported code files found in the selected folder after filtering.');
      return;
    }
    
    const ignoredCount = allFiles.length - filteredFiles.length;
    const unsupportedCount = filteredFiles.length - supportedFiles.length;
    
    if (ignoredCount > 0 || unsupportedCount > 0) {
      toast.info(
        `Filtered folder: ${supportedFiles.length} code files selected. ` +
        `${ignoredCount} ignored files/folders, ${unsupportedCount} unsupported files excluded.`
      );
    } else {
      toast.success(`Found ${supportedFiles.length} supported code files in folder.`);
    }
    
    setFiles(supportedFiles);
    setUploadMode('folder');
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/x-python': ['.py'],
      'application/zip': ['.zip'],
      'application/javascript': ['.js', '.jsx'],
      'application/typescript': ['.ts', '.tsx']
    },
    noClick: uploadMode === 'folder' // Disable click when in folder mode
  });
    const removeFile = (index) => {
    setFiles(files => files.filter((_, i) => i !== index));
    // Reset upload mode if no files left
    if (files.length === 1) {
      setUploadMode('files');
    }
  };  const handleUpload = async () => {
    if (files.length === 0) {
      onUploadError("Please select files first");
      return;
    }

    logger.log("Uploading files:", files.map(f => f.name).join(', '));
    setIsUploading(true);
    if (onUploadStart) onUploadStart();
    
    try {
      if (uploadMode === 'folder' && files.length > 1) {
        // Handle folder upload
        logger.log("Processing folder with", files.length, "files");
        setCurrentFileName(`${files.length} files`);
        setEstimatedTime(Math.min(files.length * 15, 60)); // 15s per file, max 1 minute
        setUploadProgress(`Processing folder with ${files.length} files...`);
        
        const response = await predictionService.uploadFolder(files);
        
        logger.log("Folder upload success response:", response.data);
        toast.success(`Successfully processed ${files.length} files from folder!`);
        onUploadSuccess(response.data);
          } else if (files.length === 1) {
        // Single file upload
        const file = files[0];
        const isZip = file.name.endsWith('.zip');
        
        logger.log("Uploading file:", file.name);
        setCurrentFileName(file.name);
        setEstimatedTime(isZip ? 45 : 30); // Zip files take longer
        setUploadProgress(`Processing ${file.name}...`);
        
        const response = await predictionService.uploadFile(file, isZip);
        
        logger.log("Upload success response:", response.data);
        toast.success(`Successfully uploaded ${file.name}!`);
        
        // Check for partial success status (when documentation was generated with errors)
        if (response.data.status === 'partial_success') {
          logger.log("Partial success - documentation had errors but was generated");
          toast.info("Documentation generated with some errors");
          onUploadSuccess(response.data);
        } else {
          onUploadSuccess(response.data);
        }
          } else {
        // Handle multiple individual files
        logger.log("Processing multiple individual files");
        setCurrentFileName(`${files.length} files`);
        setEstimatedTime(Math.min(files.length * 12, 60)); // 12s per file, max 1 minute
        setUploadProgress(`Processing ${files.length} files...`);
        
        const response = await predictionService.uploadMultipleFiles(files);
        
        toast.success(`Successfully processed ${files.length} files!`);
        onUploadSuccess(response.data);
      }
      
    } catch (error) {
      logger.error("Upload error details:", error);
      const errorMessage = error.response?.data?.error_message || 
                          error.response?.data?.message || 
                          'Upload failed';
      
      toast.error(`Failed to process files: ${errorMessage}`);
      
      if (error.response) {
        logger.error("Server error response:", error.response.data);
        onUploadError(`Server error: ${error.response.status} - ${errorMessage}`);
      } else if (error.request) {
        logger.error("No response received:", error.request);
        fetch('http://localhost:8000/api/ai-status/')
          .then(response => {
            if (response.ok) {
              onUploadError("Server is running but the upload request failed. Try again or use smaller files.");
            } else {
              onUploadError("No response from server. Please check if the backend server is running.");
            }
          })
          .catch(() => {
            onUploadError("No response from server. Please check if the backend server is running.");
          });
      } else {
        logger.error("Request setup error:", error.message);
        onUploadError(`Error: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };    return (
    <div className="w-full">
      {/* Upload mode selector */}
      <div className="mb-4 flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-gray-100 dark:bg-gray-800">
          <button
            onClick={() => {setUploadMode('files'); setFiles([]);}}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              uploadMode === 'files'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <File className="w-4 h-4" />
            Individual Files
          </button>
          <button
            onClick={() => {setUploadMode('folder'); setFiles([]);}}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              uploadMode === 'folder'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <Folder className="w-4 h-4" />
            Entire Folder
          </button>
        </div>
      </div>

      {uploadMode === 'files' ? (
        // File drag and drop area
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
                </p>
              </>
            )}
            <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 shadow-sm hover:shadow flex items-center gap-2 justify-center">
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
      ) : (        // Folder selection area
        <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-lg p-6 text-center bg-purple-50 dark:bg-purple-900/20">
          <div className="flex flex-col items-center justify-center gap-3">
            <FolderOpen className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            <p className="text-purple-600 dark:text-purple-400 font-medium">
              Select an entire folder to process all code files
            </p>
            <p className="text-sm text-purple-500 dark:text-purple-400">
              Will process all .py, .js, .jsx, .ts, .tsx files in the folder
            </p>
            <div className="bg-purple-100 dark:bg-purple-800/30 border border-purple-200 dark:border-purple-700 rounded-md p-3 mt-2">
              <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">
                <strong>🚀 Smart Filtering:</strong> Automatically ignores
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                node_modules, .git, build files, media files, and other non-source files
              </p>
            </div>
            <label className="mt-2 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-colors cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-400 dark:focus-within:ring-purple-600 shadow-sm hover:shadow flex items-center gap-2 justify-center">
              <FolderOpen className="w-4 h-4" />
              Select Folder
              <input
                type="file"
                directory=""
                webkitdirectory=""
                multiple
                onChange={handleFolderSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            {uploadMode === 'folder' ? (
              <>
                <Folder className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Folder Files ({files.length})
              </>
            ) : (
              <>
                <File className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Selected Files ({files.length})
              </>
            )}
          </h4>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {files.map((file, index) => (
              <div 
                key={`${file.name}-${index}`} 
                className={`flex items-center justify-between p-2 rounded-lg ${
                  uploadMode === 'folder' 
                    ? 'bg-purple-100 dark:bg-purple-900/30' 
                    : 'bg-gray-100 dark:bg-gray-800/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <File className={`w-4 h-4 ${
                    uploadMode === 'folder' 
                      ? 'text-purple-500 dark:text-purple-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                    {file.webkitRelativePath || file.name}
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
      )}      {/* Beautiful Progress Indicator */}
      <ProgressIndicator 
        isVisible={isUploading}
        fileName={currentFileName}
        estimatedTime={estimatedTime}
      /><div className="mt-4 flex justify-center">        <button 
          onClick={handleUpload}
          disabled={isUploading || files.length === 0}
          className={`flex items-center gap-2 py-2 px-4 rounded-md transition-all ${
            uploadMode === 'folder'
              ? (isUploading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-purple-500 hover:bg-purple-600 text-white hover:scale-[1.02]')
              : (isUploading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600 text-white hover:scale-[1.02]')
          }`}
        >
          {isUploading ? (
            <>
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>{uploadMode === 'folder' ? 'Processing Folder...' : 'Processing Files...'}</span>
            </>
          ) : (
            <>
              {uploadMode === 'folder' ? (
                <>
                  <FolderOpen className="w-5 h-5" />
                  <span>Process Folder ({files.length} files)</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload for Documentation</span>
                </>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUploader;

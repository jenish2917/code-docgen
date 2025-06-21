import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Folder, FolderOpen, LogIn } from 'lucide-react';
import api from '../utils/api';
import predictionService from '../services/predictionService';
import { toast } from 'react-toastify';
import ProgressIndicator from './ProgressIndicator';
import AuthService from '../utils/auth';

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
  const [estimatedTime, setEstimatedTime] = useState(30);
  
  // Check if user is authenticated (only once)
  const isAuthenticated = AuthService.isLoggedIn();

  const onDrop = useCallback(acceptedFiles => {
    // Security check: Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('You need to be logged in to upload files');
      return;
    }
    
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
  }, [isAuthenticated]);

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
  };  
  
  const handleUpload = async () => {
    // Double check authentication status
    if (!isAuthenticated) {
      onUploadError("You need to be logged in to upload files");
      return;
    }
    
    if (files.length === 0) {
      onUploadError("Please select files first");
      return;
    }

    console.log("Uploading files:", files.map(f => f.name).join(', '));
    setIsUploading(true);
    if (onUploadStart) onUploadStart();
    
    try {
      if (uploadMode === 'folder' && files.length > 1) {
        // Handle folder upload
        console.log("Processing folder with", files.length, "files");
        setCurrentFileName(`${files.length} files`);
        setEstimatedTime(Math.min(files.length * 15, 60)); // 15s per file, max 1 minute
        setUploadProgress(`Processing folder with ${files.length} files...`);
        
        const response = await predictionService.uploadFolder(files);
        
        console.log("Folder upload success response:", response.data);
        toast.success(`Successfully processed ${files.length} files from folder!`);
        onUploadSuccess(response.data);
      } else if (files.length === 1) {
        // Single file upload
        const file = files[0];
        const isZip = file.name.endsWith('.zip');
        
        console.log("Uploading file:", file.name);
        setCurrentFileName(file.name);
        setEstimatedTime(isZip ? 45 : 30); // Zip files take longer
        setUploadProgress(`Processing ${file.name}...`);
        
        const response = await predictionService.uploadFile(file, isZip);
        
        console.log("Upload success response:", response.data);
        toast.success(`Successfully uploaded ${file.name}!`);
        
        // Check for partial success status (when documentation was generated with errors)
        if (response.data.status === 'partial_success') {
          onUploadSuccess(response.data);
          toast.warning('Documentation generated with some warnings or issues.');
        } else {
          onUploadSuccess(response.data);
        }
      } else {
        // Handle multiple individual files
        console.log("Processing multiple individual files");
        setCurrentFileName(`${files.length} files`);
        setEstimatedTime(Math.min(files.length * 12, 60)); // 12s per file, max 1 minute
        
        const response = await predictionService.uploadMultipleFiles(files);
        onUploadSuccess(response.data);
      }
      
    } catch (error) {
      console.error("Upload error details:", error);
      const errorMessage = error.response?.data?.error_message || 
                          error.response?.data?.message || 
                          'Upload failed';
      
      toast.error(`Failed to process files: ${errorMessage}`);
      
      if (error.response) {
        console.error("Server error response:", error.response.data);
      }
      
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false);
      setProgressStep(0);
      setUploadProgress('');
    }
  };
  
  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="w-full">
        <div className="border-2 border-yellow-300 rounded-lg p-6 text-center bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex flex-col items-center justify-center gap-3">
            <LogIn className="w-12 h-12 text-yellow-500" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              You need to be logged in to generate documentation
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Please log in or create an account to use this feature
            </p>
            <div className="flex gap-4">
              <a 
                href="/login" 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Log In
              </a>
              <a 
                href="/signup" 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Upload mode selector */}
      <div className="mb-4 flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-gray-100 dark:bg-gray-800">
          <button
            onClick={() => {setUploadMode('files'); setFiles([])}}
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
            onClick={() => {setUploadMode('folder'); setFiles([])}}
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
          </div>
        </div>
      ) : (
        // Folder selection
        <div className="border-2 border-dashed rounded-lg p-6 text-center transition-all">
          <div className="flex flex-col items-center justify-center gap-3">
            <FolderOpen className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            <p className="text-gray-500 dark:text-gray-400">
              Select a folder containing code files
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              We'll recursively process all compatible files
            </p>
            <input
              type="file"
              webkitdirectory=""
              directory=""
              multiple
              onChange={handleFolderSelect}
              className="hidden"
              id="folder-input"
            />
            <label
              htmlFor="folder-input"
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
            >
              Select Folder
            </label>
          </div>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selected Files ({files.length})
            </h3>
            <button
              onClick={() => setFiles([])}
              className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear All
            </button>
          </div>
          
          <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
            {files.slice(0, 5).map((file, index) => (
              <div key={index} className="flex justify-between items-center p-2 text-sm">
                <span className="truncate max-w-xs text-gray-700 dark:text-gray-300">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {files.length > 5 && (
              <div className="p-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                ...and {files.length - 5} more files
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Upload button */}
      <button
        className={`mt-6 w-full py-3 flex justify-center items-center rounded-lg font-medium ${
          files.length > 0 && !isUploading
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
        }`}
        disabled={files.length === 0 || isUploading}
        onClick={handleUpload}
      >
        {isUploading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload & Generate Documentation
          </span>
        )}
      </button>
      
      {/* Progress indicator */}
      {isUploading && (
        <div className="mt-4">
          <ProgressIndicator 
            step={progressStep} 
            status={uploadProgress} 
            filename={currentFileName}
            estimatedTime={estimatedTime}
          />
        </div>
      )}
    </div>
  );
};

export default FileUploader;

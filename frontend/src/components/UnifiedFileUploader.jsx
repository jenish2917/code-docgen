import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Folder, FolderOpen, LogIn } from 'lucide-react';
import api from '../utils/api';
import predictionService from '../services/predictionService';
import { toast } from 'react-toastify';
import ProgressIndicator from './ProgressIndicator';
import AuthService from '../utils/auth';
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
 * Unified File Uploader Component with Authentication Support
 * 
 * Features:
 * - Optional authentication integration
 * - File size validation (10MB limit per file)
 * - Maximum file count validation (100 files)
 * - MIME type validation
 * - Enhanced error handling with centralized logging
 * - Folder upload support with smart filtering
 * - Progress tracking and estimated completion time
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onUploadSuccess - Success callback
 * @param {Function} props.onUploadError - Error callback
 * @param {Function} props.onUploadStart - Upload start callback
 * @param {boolean} props.requireAuth - Whether authentication is required
 * @param {boolean} props.isAuthenticated - Whether the user is authenticated
 * @param {string} props.loginRedirect - URL to redirect to for login
 * @returns {JSX.Element} UnifiedFileUploader component
 */
const UnifiedFileUploader = ({ 
  onUploadSuccess, 
  onUploadError, 
  onUploadStart,
  requireAuth = false,
  isAuthenticated = true,
  loginRedirect = '/login'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState('');
  const [progressStep, setProgressStep] = useState(0);
  const [uploadMode, setUploadMode] = useState('files'); // 'files' or 'folder'
  const [currentFileName, setCurrentFileName] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(30);
  const [progress, setProgress] = useState(0);
  
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

  // Enhanced file drop handler with security validation
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

  // Handle single file upload
  const handleSingleFileUpload = async (file) => {
    logger.log("Uploading single file:", file.name);
    
    setCurrentFileName(file.name);
    const isZip = file.name.endsWith('.zip');
    setEstimatedTime(isZip ? 45 : 30); // Zip files take longer
    setUploadProgress(`Processing ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/upload/', formData);
      
      setIsUploading(false);
      if (onUploadSuccess) onUploadSuccess(response.data);
      toast.success(`Successfully uploaded ${file.name}!`);
      
      return response;
    } catch (error) {
      logger.error("File upload error:", error);
      setIsUploading(false);
      
      const errorMessage = error.response?.data?.error_message || 
                         error.response?.data?.message || 
                         'Upload failed';
      
      toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
      if (onUploadError) onUploadError(errorMessage);
      throw error;
    }
  };

  // Handle multiple files upload
  const handleMultipleFilesUpload = async (files) => {
    logger.log("Uploading multiple files:", files.length);
    
    setCurrentFileName(`${files.length} files`);
    setEstimatedTime(Math.min(files.length * 12, 60)); // 12s per file, max 1 minute
    setUploadProgress(`Processing ${files.length} files...`);

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });
      
      const response = await api.post('/upload/multiple/', formData);
      
      setIsUploading(false);
      if (onUploadSuccess) onUploadSuccess({
        ...response.data,
        generator: 'multiple'
      });
      
      toast.success(`Successfully processed ${files.length} files!`);
      return response;
    } catch (error) {
      logger.error("Multiple files upload error:", error);
      setIsUploading(false);
      
      const errorMessage = error.response?.data?.error_message || 
                         error.response?.data?.message || 
                         'Upload failed';
      
      toast.error(`Failed to process multiple files: ${errorMessage}`);
      if (onUploadError) onUploadError(errorMessage);
      throw error;
    }
  };

  // Handle folder upload (batch processing)
  const handleFolderUpload = async (files) => {
    logger.log("Processing folder with", files.length, "files");
    setCurrentFileName(`${files.length} files`);
    setEstimatedTime(Math.min(files.length * 15, 60)); // 15s per file, max 1 minute
    setProgressStep(1);
    setUploadProgress(`Preparing ${files.length} files...`);
    
    try {
      // For larger folders, process files in batches
      const totalFiles = files.length;
      let processedFiles = 0;
      
      if (totalFiles > 20) {
        // Process in batches for large folders
        const batchSize = 5;
        const batchCount = Math.ceil(totalFiles / batchSize);
        
        setProgressStep(2);
        setUploadProgress(`Processing files in ${batchCount} batches...`);
        
        const results = [];
        
        for (let i = 0; i < totalFiles; i += batchSize) {
          const batch = files.slice(i, i + batchSize);
          setCurrentFileName(`Batch ${Math.floor(i/batchSize) + 1}/${batchCount}`);
          
          for (const file of batch) {
            const fileData = new FormData();
            fileData.append('file', file);
            
            try {
              const response = await api.post('/upload/', fileData);
              processedFiles += 1;
              setProgress(Math.round((processedFiles / totalFiles) * 100));
              results.push(response.data);
            } catch (err) {
              logger.error(`Error processing file ${file.name}:`, err);
            }
          }
        }
        
        // Call prediction service to get results
        setProgressStep(3);
        setUploadProgress('Generating documentation...');
        
        setIsUploading(false);
        toast.success(`Successfully processed ${processedFiles} of ${totalFiles} files!`);
        
        if (onUploadSuccess) {
          onUploadSuccess({
            status: 'success',
            message: `Processed ${processedFiles} of ${totalFiles} files`,
            documentation: results.map(r => r.documentation || r.doc || '').join('\n\n---\n\n'),
            generator: 'folder',
            processed_count: processedFiles,
            total_count: totalFiles
          });
        }
        
        return { data: { status: 'success' } };
      } else {
        // For smaller folders, upload all files at once
        const formData = new FormData();
        files.forEach(file => {
          formData.append('files', file);
        });
        
        setProgressStep(2);
        setUploadProgress(`Uploading ${files.length} files...`);
        
        const response = await api.post('/upload/folder/', formData);
        
        setIsUploading(false);
        if (onUploadSuccess) onUploadSuccess({
          ...response.data,
          generator: 'folder'
        });
        
        toast.success(`Successfully processed all ${files.length} files!`);
        return response;
      }
    } catch (error) {
      logger.error("Error processing folder:", error);
      setIsUploading(false);
      
      const errorMessage = error.response?.data?.error_message || 
                         error.response?.data?.message || 
                         'Folder processing failed';
      
      toast.error(`Failed to process folder: ${errorMessage}`);
      if (onUploadError) onUploadError(errorMessage);
      throw error;
    }
  };

  // Main upload handler
  const handleUpload = async () => {
    if (files.length === 0) {
      onUploadError("Please select files first");
      return;
    }

    // Check authentication if required
    if (requireAuth && !isAuthenticated) {
      toast.error("Please log in to upload files");
      window.location.href = loginRedirect;
      return;
    }

    logger.log("Uploading files:", files.map(f => f.name).join(', '));
    setIsUploading(true);
    setProgress(0);
    if (onUploadStart) onUploadStart();
    
    try {
      if (uploadMode === 'folder' && files.length > 1) {
        // Handle folder upload
        await handleFolderUpload(files);
      } else if (files.length === 1) {
        // Single file upload
        const response = await handleSingleFileUpload(files[0]);
        
        // Check for partial success status (when documentation was generated with errors)
        if (response.data.status === 'partial_success') {
          logger.log("Partial success - documentation had errors but was generated");
          toast.info("Documentation generated with some errors");
        }
      } else {
        // Handle multiple individual files
        await handleMultipleFilesUpload(files);
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
        fetch('/api/ai-status/')
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
      setProgressStep(0);
    }
  };
  // Authentication prompt view when not authenticated
  const AuthPromptView = () => (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-300/50 dark:border-blue-600/50 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full"></div>
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full"></div>
      
      <div className="relative z-10 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <LogIn className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Ready to Upload?</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md leading-relaxed">
          Create an account or log in to upload your code files and generate comprehensive AI-powered documentation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={loginRedirect}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Log In
          </a>
          <a
            href="/signup"
            className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-600"
          >
            Sign Up Free
          </a>
        </div>
      </div>
    </div>
  );  return (
    <div className="w-full space-y-6">
      {!isAuthenticated && requireAuth && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-xl">
          <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Explore & Preview</p>
              <p className="text-sm">
                You can explore the interface and select files. 
                <a href={loginRedirect} className="underline hover:text-blue-800 dark:hover:text-blue-200 ml-1 font-medium">
                  Login
                </a> to upload and generate documentation.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Upload mode selector */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
          <button
            onClick={() => {setUploadMode('files'); setFiles([]);}}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              uploadMode === 'files'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <File className="w-4 h-4" />
            Individual Files
          </button>
          <button
            onClick={() => {setUploadMode('folder'); setFiles([]);}}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              uploadMode === 'folder'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700'
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
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer relative overflow-hidden ${
            isDragActive 
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 scale-105' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          <input {...getInputProps()} />
          {/* Background decoration */}
          {isDragActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-2xl"></div>
          )}
          
          <div className="relative z-10 flex flex-col items-center justify-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragActive 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg scale-110' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
            }`}>
              <Upload className="w-8 h-8" />
            </div>
            
            {isDragActive ? (
              <div className="text-center">
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Drop files here!</p>
                <p className="text-sm text-blue-500 dark:text-blue-300">Release to upload your code files</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Drag & drop your code files
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  or click to browse and select files
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {['.py', '.js', '.jsx', '.ts', '.tsx', '.zip'].map((ext) => (
                    <span key={ext} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs font-mono">
                      {ext}
                    </span>
                  ))}
                </div>
                <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2 mx-auto">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Select Files
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Folder selection area
        <div className="border-2 border-dashed border-purple-300/50 dark:border-purple-600/50 rounded-2xl p-8 text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <FolderOpen className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">
                Process Entire Folder
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mb-4">
                Upload all code files from a project folder at once
              </p>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-purple-200 dark:border-purple-700 rounded-xl p-4 max-w-md">
              <p className="text-xs text-purple-700 dark:text-purple-300 mb-2 font-semibold">
                🚀 Smart Filtering Included:
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 leading-relaxed">
                Automatically ignores node_modules, .git, build directories, and other non-source files
              </p>
            </div>
            
            <label className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-xl transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Select Project Folder
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
      )}

      {files.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-3">
            {uploadMode === 'folder' ? (
              <>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Folder className="w-4 h-4 text-white" />
                </div>
                <span>Folder Files ({files.length})</span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <File className="w-4 h-4 text-white" />
                </div>
                <span>Selected Files ({files.length})</span>
              </>
            )}
          </h4>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {files.map((file, index) => (
              <div 
                key={`${file.name}-${index}`} 
                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  uploadMode === 'folder' 
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-700/50' 
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-700/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <File className={`w-4 h-4 ${
                    uploadMode === 'folder' 
                      ? 'text-purple-500 dark:text-purple-400' 
                      : 'text-blue-500 dark:text-blue-400'
                  }`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                    {file.webkitRelativePath || file.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-700/60 px-2 py-1 rounded-full">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
                <button 
                  onClick={() => removeFile(index)} 
                  className="p-2 hover:bg-white/60 dark:hover:bg-gray-700/60 rounded-full transition-all duration-200 group"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <ProgressIndicator 
        isVisible={isUploading}
        fileName={currentFileName}
        estimatedTime={estimatedTime}
        progress={progress}
      />

      <div className="flex justify-center">
        {!isAuthenticated && requireAuth ? (
          <AuthPromptView />
        ) : (
          <button 
            onClick={handleUpload}
            disabled={isUploading || files.length === 0}
            className={`flex items-center gap-3 py-4 px-8 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              uploadMode === 'folder'
                ? (isUploading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white')
                : (isUploading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white')
            } ${files.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUploading ? (
              <>
                <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{uploadMode === 'folder' ? 'Processing Folder...' : 'Processing Files...'}</span>
              </>
            ) : (
              <>
                {uploadMode === 'folder' ? (
                  <>
                    <FolderOpen className="w-6 h-6" />
                    <span>Process Folder ({files.length} files)</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6" />
                    <span>Generate Documentation</span>
                  </>
                )}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default UnifiedFileUploader;

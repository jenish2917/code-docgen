"""
Enhanced Django views for code documentation generation with improved error handling and performance.

This module provides RESTful API endpoints for:
- File upload and processing
- Documentation generation for individual files
- Bulk documentation generation for project folders
- Project analysis and statistics
- Export functionality for generated documentation

Performance optimizations:
- Asynchronous processing for large files
- Caching for repeated operations
- Efficient file handling and memory management
- Progress tracking for long-running operations

Author:             if not doc_content:
                return Response(
                    {'status': 'error', 'message': 'No documentation content provided (doc_content is required)'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Detailed request validation
            if not isinstance(doc_content, str):
                logger.error(f"CreateTempDocumentView: Invalid doc_content type: {type(doc_content)}")
                return Response(
                    {
                        'status': 'error',
                        'message': 'Invalid doc_content format. Expected string.',
                        'received_type': str(type(doc_content))
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate export format
            supported_formats = ['pdf', 'html', 'md', 'txt', 'docx']
            if not export_format:
                logger.error("CreateTempDocumentView: Missing export format")
                return Response(
                    {
                        'status': 'error',
                        'message': 'Export format is required. Please specify a format.',
                        'supported_formats': supported_formats
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            if export_format not in supported_formats:
                logger.error(f"CreateTempDocumentView: Invalid format: {export_format}")
                return Response(
                    {
                        'status': 'error',
                        'message': f'Unsupported format "{export_format}". Supported formats are: {", ".join(supported_formats)}',
                        'supported_formats': supported_formats,
                        'received_format': export_format
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )on Generator Team
Date: June 2025
Version: 2.0.0
"""

import os
import time
import tempfile
import zipfile
import shutil
import traceback
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, parser_classes
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.http import HttpResponse, FileResponse
import logging
import shutil

from .models import CodeFile, Documentation
from core.utils.document_export import DocumentationGenerator
from .utils.system_status import check_system_status
from .utils.codebase_analyzer import parse_codebase
from core.utils.project_documentation_generator import ProjectDocumentationGenerator

logger = logging.getLogger(__name__)

# Performance tracking decorator
def track_performance(func):
    """
    Decorator to track API endpoint performance and log execution times.
    
    Args:
        func: The function to be decorated
        
    Returns:
        wrapper: The decorated function with performance tracking
    """
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            logger.info(f"{func.__name__} executed in {execution_time:.2f}s")
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"{func.__name__} failed after {execution_time:.2f}s: {str(e)}")
            raise
    return wrapper

# Performance constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
CHUNK_SIZE = 8192  # 8KB chunks for memory efficiency

class UploadCodeView(APIView):
    """
    Enhanced code file upload view with performance optimizations and security
    
    Features:
    - File size validation (10MB limit)
    - Chunked file processing for memory efficiency
    - Enhanced error handling with detailed logging
    - Support for multiple programming languages
    - AI-powered documentation generation
    """
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]
    
    def _validate_file(self, uploaded_file) -> Tuple[bool, str]:
        """
        Validate uploaded file for security and size constraints
        
        Args:
            uploaded_file: Django UploadedFile object
            
        Returns:
            Tuple[bool, str]: (is_valid, error_message)
        """
        if uploaded_file.size > MAX_FILE_SIZE:
            return False, f'File too large. Maximum size allowed: {MAX_FILE_SIZE // (1024*1024)}MB'
        
        # Additional security checks can be added here
        return True, ""
    
    def _save_file_chunked(self, uploaded_file, save_path: str) -> None:
        """
        Save file using chunked writing for memory efficiency
        
        Args:
            uploaded_file: Django UploadedFile object
            save_path: Destination file path
        """
        with open(save_path, 'wb') as f:
            for chunk in uploaded_file.chunks(chunk_size=CHUNK_SIZE):
                f.write(chunk)
    
    @track_performance
    def post(self, request):
        """
        Handle single file upload with enhanced validation and processing
        """
        start_time = time.time()
        
        if 'file' not in request.FILES:
            return Response({'status': 'error', 'message': 'No file provided'}, status=400)
            
        uploaded_file = request.FILES['file']
        
        # Validate file
        is_valid, error_msg = self._validate_file(uploaded_file)
        if not is_valid:
            return Response({'status': 'error', 'message': error_msg}, status=400)
        
        os.makedirs('media', exist_ok=True)
        os.makedirs('docs_output', exist_ok=True)
        
        try:
            # Check if file is supported for AI documentation
            from .utils.llm_integration import is_supported_file, get_file_language
            
            if is_supported_file(uploaded_file.name):
                try:
                    file_language = get_file_language(uploaded_file.name)
                    print(f"🤖 Generating AI documentation for {file_language} file: {uploaded_file.name}")
                    
                    # Create CodeFile model instance - this will save the file
                    code_file = CodeFile.objects.create(
                        title=uploaded_file.name,
                        file=uploaded_file,
                        language=file_language
                    )
                    
                    # Save file to temporary location for processing
                    save_path = f'media/{uploaded_file.name}'
                    with open(save_path, 'wb+') as f:
                        for chunk in uploaded_file.chunks():
                            f.write(chunk)
                    
                    doc_content, generator = parse_codebase(save_path)
                    doc_path = f'docs_output/{uploaded_file.name}_doc.md'
                      # Determine if AI was used (removed OpenRouter - paid service)
                    ai_generated = generator in ["AI-Enhanced", "AI-Generated", "ollama"]
                    with open(doc_path, 'w', encoding='utf-8') as f:
                        f.write(doc_content)
                    
                    # Create Documentation model instance
                    documentation = Documentation.objects.create(
                        code_file=code_file,
                        content=doc_content,
                        file_path=doc_path,
                        owner=request.user  # User is guaranteed to be authenticated
                    )
                    
                    print(f"✅ Saved to database: CodeFile ID {code_file.id}, Documentation ID {documentation.id}")
                    
                    return Response({
                        'status': 'success', 
                        'documentation': doc_content,
                        'filename': uploaded_file.name,
                        'message': f'AI documentation generated successfully for {file_language} file',
                        'ai_generated': ai_generated,
                        'generator': generator,
                        'file_language': file_language,
                        'code_file_id': code_file.id,
                        'documentation_id': documentation.id
                    })
                except Exception as e:
                    print(f"❌ Error generating documentation: {e}")
                    import traceback
                    traceback.print_exc()
                    return Response({
                        'status': 'error',
                        'message': f'Error generating documentation: {str(e)}'
                    }, status=500)
            else:
                return Response({
                    'status': 'error',
                    'message': f'File type not supported. Supported types: Python, JavaScript, TypeScript, Java, C/C++, C#, PHP, Ruby, Go, Rust, and more.'
                }, status=400)
                    
        except Exception as e:
            print(f"❌ Error saving file: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'status': 'error', 
                'message': f'Error saving file: {str(e)}'
            }, status=500)

class UploadProjectView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]
    
    @track_performance
    def post(self, request):
        """Project upload with comprehensive analysis and documentation."""
        try:
            if 'file' not in request.FILES:
                return Response({'error': 'No file provided'}, status=400)
            
            uploaded_file = request.FILES['file']
            
            if not uploaded_file.name.endswith('.zip'):
                return Response({'error': 'Only ZIP files are supported'}, status=400)
            
            print(f"🚀 Processing project: {uploaded_file.name}")
            
            # Create temporary directory
            temp_dir = tempfile.mkdtemp()
            zip_path = os.path.join(temp_dir, uploaded_file.name)
            
            # Save uploaded ZIP file
            with open(zip_path, 'wb+') as f:
                for chunk in uploaded_file.chunks():
                    f.write(chunk)
            
            # Extract ZIP file
            extract_dir = os.path.join(temp_dir, 'extracted')
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
            
            # Get project name from ZIP file
            project_name = os.path.splitext(uploaded_file.name)[0]
            
            # Initialize project documentation generator
            doc_generator = ProjectDocumentationGenerator()
            
            print(f"📊 Analyzing project structure...")
            
            # Generate comprehensive project documentation
            master_doc, file_docs = doc_generator.generate_project_documentation(
                extract_dir, 
                project_name
            )
            
            print(f"📝 Generated documentation for {len(file_docs)} files")
            
            # Create documentation output directory
            project_doc_dir = os.path.join('docs_output', f'{project_name}_project_docs')
            os.makedirs(project_doc_dir, exist_ok=True)
            
            # Save master documentation
            master_doc_path = os.path.join(project_doc_dir, f'{project_name}_master_documentation.md')
            with open(master_doc_path, 'w', encoding='utf-8') as f:
                f.write(master_doc)
            
            # Save individual file documentation
            for file_path, doc_content in file_docs.items():
                safe_filename = file_path.replace('/', '_').replace('\\', '_')
                file_doc_path = os.path.join(project_doc_dir, f'{safe_filename}_documentation.md')
                with open(file_doc_path, 'w', encoding='utf-8') as f:
                    f.write(doc_content)
            
            # Create index file
            index_content = f"""# {project_name} - Project Documentation Index

## Master Documentation
- [Complete Project Analysis]({project_name}_master_documentation.md)

## Individual File Documentation
"""
            for file_path in file_docs.keys():
                safe_filename = file_path.replace('/', '_').replace('\\', '_')
                index_content += f"- [{file_path}]({safe_filename}_documentation.md)\n"
            
            index_path = os.path.join(project_doc_dir, 'README.md')
            with open(index_path, 'w', encoding='utf-8') as f:
                f.write(index_content)
            
            # Cleanup temporary directory
            shutil.rmtree(temp_dir, ignore_errors=True)
            
            print(f"✅ Project documentation complete!")
            
            return Response({
                'status': 'success',
                'project_name': project_name,
                'files_processed': len(file_docs),
                'master_documentation': master_doc[:1000] + '...' if len(master_doc) > 1000 else master_doc,
                'docs_directory': project_doc_dir,
                'master_doc_path': master_doc_path,
                'index_path': index_path,
                'file_count': len(file_docs),
                'message': f'Successfully analyzed and documented {len(file_docs)} files with comprehensive project structure analysis'
            })
            
        except Exception as e:
            if 'temp_dir' in locals():
                shutil.rmtree(temp_dir, ignore_errors=True)
            
            print(f"❌ Project analysis error: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'status': 'error',
                'message': f'Error processing project: {str(e)}'
            }, status=500)
    
    def _get_current_timestamp(self):
        """Get current timestamp for documentation."""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

class GenerateDocsView(APIView):
    permission_classes = [IsAuthenticated]
    
    @track_performance
    def post(self, request):
        filename = request.data.get('filename', 'unknown.py')
        code_content = request.data.get('code_content', '')        
        if not code_content:
            return Response({
                'status': 'error', 
                'message': 'No code content provided'
            }, status=400)
        
        try:
            # Create temporary file
            temp_file_path = f'temp_{filename}'
            with open(temp_file_path, 'w', encoding='utf-8') as f:
                f.write(code_content)
            
            # Generate documentation
            try:
                doc_content, generator = parse_codebase(temp_file_path)
                
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
                
                return Response({
                    'status': 'success',
                    'documentation': doc_content,
                    'filename': filename,
                    'message': 'Documentation generated successfully'
                })
                
            except Exception as e:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
                
                return Response({
                    'status': 'error',
                    'message': f'Error generating documentation: {str(e)}'
                }, status=500)
                
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Error processing code: {str(e)}'
            }, status=500)

class UploadMultipleFilesView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]
    
    @track_performance
    def post(self, request):
        if 'files' not in request.FILES:
            return Response({'status': 'error', 'message': 'No files provided'}, status=400)
        
        files = request.FILES.getlist('files')
        results = []
        
        os.makedirs('media', exist_ok=True)
        os.makedirs('docs_output', exist_ok=True)
        
        for uploaded_file in files:
            try:
                # Check if file is supported for AI documentation
                from .utils.llm_integration import is_supported_file, get_file_language
                
                if is_supported_file(uploaded_file.name):
                    try:
                        file_language = get_file_language(uploaded_file.name)
                        print(f"🤖 Processing {file_language} file: {uploaded_file.name}")
                        
                        # Create CodeFile model instance
                        code_file = CodeFile.objects.create(
                            title=uploaded_file.name,
                            file=uploaded_file,
                            language=file_language
                        )
                        
                        # Save file to temporary location for processing
                        save_path = f'media/{uploaded_file.name}'
                        with open(save_path, 'wb+') as f:
                            for chunk in uploaded_file.chunks():
                                f.write(chunk)                        
                        doc_content, generator = parse_codebase(save_path)
                        doc_path = f'docs_output/{uploaded_file.name}_doc.md'
                        with open(doc_path, 'w', encoding='utf-8') as f:
                            f.write(doc_content)
                        
                        # Create Documentation model instance
                        documentation = Documentation.objects.create(
                            code_file=code_file,
                            content=doc_content,
                            file_path=doc_path,
                            owner=request.user  # User is guaranteed to be authenticated
                        )
                        
                        print(f"✅ Saved to database: CodeFile ID {code_file.id}, Documentation ID {documentation.id}")
                        
                        results.append({
                            'filename': uploaded_file.name,
                            'status': 'success',
                            'documentation': doc_content[:500] + '...' if len(doc_content) > 500 else doc_content,
                            'doc_path': doc_path,
                            'code_file_id': code_file.id,
                            'documentation_id': documentation.id,
                            'language': file_language
                        })
                    except Exception as e:
                        print(f"❌ Error processing {uploaded_file.name}: {e}")
                        results.append({
                            'filename': uploaded_file.name,
                            'status': 'error',
                            'message': f'Error generating documentation: {str(e)}'
                        })
                else:
                    results.append({
                        'filename': uploaded_file.name,
                        'status': 'skipped',
                        'message': 'File type not supported for documentation generation'
                    })
                    
            except Exception as e:
                print(f"❌ Error processing {uploaded_file.name}: {e}")
                results.append({
                    'filename': uploaded_file.name,
                    'status': 'error',
                    'message': f'Error processing file: {str(e)}'
                })
        
        return Response({
            'status': 'completed',
            'results': results,
            'total_files': len(files),
            'successful': len([r for r in results if r['status'] == 'success'])
        })

class UploadFolderView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]
    
    @track_performance
    def post(self, request):
        # Check for folder files first, then fallback to regular files
        if 'folder_files' in request.FILES:
            files = request.FILES.getlist('folder_files')
            file_paths = request.data.getlist('file_paths', [])
        elif 'files' in request.FILES:
            files = request.FILES.getlist('files')
            file_paths = []
        else:
            return Response({'status': 'error', 'message': 'No files provided'}, status=400)
        
        folder_name = request.data.get('folder_name', 'uploaded_folder')
        
        print(f"📁 Processing folder upload with {len(files)} files")
        
        results = []
        
        os.makedirs('media', exist_ok=True)
        os.makedirs('docs_output', exist_ok=True)
        
        folder_path = f'media/{folder_name}'
        os.makedirs(folder_path, exist_ok=True)
        
        for uploaded_file in files:
            try:
                # Preserve folder structure
                relative_path = uploaded_file.name
                save_path = os.path.join(folder_path, relative_path)
                
                # Create directories if needed
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                
                with open(save_path, 'wb+') as f:
                    for chunk in uploaded_file.chunks():
                        f.write(chunk)

                # Check if file is supported for AI documentation
                from .utils.llm_integration import is_supported_file, get_file_language
                
                if is_supported_file(uploaded_file.name):
                    try:
                        file_language = get_file_language(uploaded_file.name)
                        print(f"🤖 Generating AI documentation for {file_language} file: {relative_path}")
                        
                        # Create CodeFile model instance
                        code_file = CodeFile.objects.create(
                            title=f"{folder_name}/{relative_path}",
                            file=uploaded_file,
                            language=file_language
                        )
                        
                        doc_content, generator = parse_codebase(save_path)
                        doc_filename = relative_path.replace('/', '_').replace('\\', '_')
                        doc_path = f'docs_output/{folder_name}_{doc_filename}_doc.md'

                        # Determine if AI was used (removed OpenRouter - paid service)
                        ai_generated = generator in ["AI-Enhanced", "AI-Generated", "ollama"]
                        with open(doc_path, 'w', encoding='utf-8') as f:
                            f.write(doc_content)
                          
                        # Create Documentation model instance
                        documentation = Documentation.objects.create(
                            code_file=code_file,
                            content=doc_content,
                            file_path=doc_path,
                            owner=request.user  # User is guaranteed to be authenticated
                        )
                        
                        results.append({
                            'filename': relative_path,
                            'status': 'success',
                            'documentation': doc_content[:300] + '...' if len(doc_content) > 300 else doc_content,
                            'doc_path': doc_path,
                            'ai_generated': ai_generated,
                            'generator': generator,
                            'file_language': file_language,
                            'code_file_id': code_file.id,
                            'documentation_id': documentation.id
                        })
                    except Exception as e:
                        results.append({
                            'filename': relative_path,
                            'status': 'error',
                            'message': f'Error generating documentation: {str(e)}'
                        })
                else:
                    results.append({
                        'filename': relative_path,
                        'status': 'uploaded',
                        'message': 'File uploaded successfully'
                    })
                    
            except Exception as e:
                results.append({
                    'filename': uploaded_file.name,
                    'status': 'error',
                    'message': f'Error processing file: {str(e)}'
                })
        
        return Response({
            'status': 'completed',
            'folder_name': folder_name,
            'results': results,
            'total_files': len(files),
            'documented': len([r for r in results if r['status'] == 'success'])
        })

class ExportDocsView(APIView):
    """Export documentation in various formats with enhanced error handling"""
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Handle documentation export requests with improved error handling"""
        try:
            doc_content = request.data.get('doc_content', '')
            filename = request.data.get('filename', 'documentation')
            export_format = request.data.get('format', 'pdf').lower()
            project_path = request.data.get('project_path', settings.BASE_DIR)

            if not doc_content:
                return Response(
                    {'status': 'error', 'message': 'No documentation content provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate format
            supported_formats = ['pdf', 'html', 'md', 'txt', 'docx']
            if export_format not in supported_formats:
                return Response(
                    {
                        'status': 'error',
                        'message': f'Unsupported format. Supported formats: {", ".join(supported_formats)}'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            from .utils.document_export import DocumentationGenerator

            # Ensure the export directory exists
            export_dir = os.path.join(settings.MEDIA_ROOT, 'exports')
            os.makedirs(export_dir, exist_ok=True)

            # Generate and get the exported file path
            try:
                timestamp = int(time.time())
                output_path = DocumentationGenerator.create_temporary_file(
                    content=doc_content,
                    export_format=export_format,
                    filename=f'{filename}_{timestamp}'
                )

                # Get the download URL
                download_url = DocumentationGenerator.get_download_url(output_path)

                return Response({
                    'status': 'success',
                    'download_url': download_url,
                    'filename': os.path.basename(output_path)
                })

            except Exception as export_error:
                # If PDF fails, try HTML as fallback
                if export_format == 'pdf':
                    try:
                        # Try HTML fallback
                        fallback_format = 'html'
                        output_path = DocumentationGenerator.analyze_and_export(
                            project_path=project_path,
                            output_format=fallback_format,
                            output_dir=export_dir
                        )
                        
                        relative_path = os.path.relpath(output_path, settings.MEDIA_ROOT)
                        download_url = f'{settings.MEDIA_URL}{relative_path}'.replace('\\', '/')

                        return Response({
                            'status': 'warning',
                            'message': f'PDF generation failed. Created HTML version instead: {str(export_error)}',
                            'download_url': download_url,
                            'filename': os.path.basename(output_path)
                        })

                    except Exception as fallback_error:
                        return Response({
                            'status': 'error',
                            'message': f'Export failed and fallback also failed. Original error: {str(export_error)}. Fallback error: {str(fallback_error)}'
                        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                return Response({
                    'status': 'error',
                    'message': f'Failed to export documentation: {str(export_error)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Unexpected error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CreateTempDocumentView(APIView):
    """
    Create a temporary document file for preview or processing
    """
    permission_classes = [AllowAny]  # Temporarily allow all access for testing

    @track_performance
    def post(self, request):
        """Create a temporary document in the specified format"""
        try:
            # Log request details
            logger.info(f"CreateTempDocumentView: Received request with data keys: {request.data.keys()}")
            logger.info(f"CreateTempDocumentView: Content-Type: {request.content_type}")
            logger.info(f"CreateTempDocumentView: Auth header: {request.headers.get('Authorization', 'No Auth header')}")
            
            # Extract data from request with detailed validation
            # Support both 'content' and 'doc_content' field names for compatibility
            doc_content = request.data.get('doc_content') or request.data.get('content')
            filename = request.data.get('filename')
            export_format = request.data.get('format', '').lower()
            
            # Log parsed values
            logger.info(f"CreateTempDocumentView: Content present: {bool(doc_content)}")
            logger.info(f"CreateTempDocumentView: Content length: {len(doc_content) if doc_content else 0}")
            logger.info(f"CreateTempDocumentView: Content type: {type(doc_content)}")
            logger.info(f"CreateTempDocumentView: Filename: {filename}")
            logger.info(f"CreateTempDocumentView: Export format: {export_format}")
            logger.info(f"CreateTempDocumentView: Raw data: {request.data}")

            # Validate required fields
            if not doc_content:
                return Response(
                    {'status': 'error', 'message': 'No documentation content provided (doc_content is required)'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            logger.info("CreateTempDocumentView: Initializing document creation")
            try:
                # Try to create the temporary file
                temp_file = DocumentationGenerator.create_temporary_file(
                    content=doc_content,
                    export_format=export_format,
                    filename=filename if filename else f'documentation_{int(time.time())}'
                )
                logger.info(f"CreateTempDocumentView: Successfully created file at {temp_file}")
            except Exception as e:
                error_msg = str(e)
                logger.error(f"CreateTempDocumentView: Document creation failed - {error_msg}")
                return Response({
                    'status': 'error',
                    'message': f'Failed to create document: {error_msg}',
                    'details': {
                        'format': export_format,
                        'content_length': len(doc_content) if doc_content else 0
                    }
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Validate format
            supported_formats = ['pdf', 'html', 'md', 'txt', 'docx']
            if export_format not in supported_formats:
                return Response(
                    {
                        'status': 'error',
                        'message': f'Unsupported format. Supported formats: {", ".join(supported_formats)}'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Ensure media directories exist
            os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
            os.makedirs(os.path.join(settings.MEDIA_ROOT, 'temp'), exist_ok=True)
            os.makedirs(os.path.join(settings.MEDIA_ROOT, 'exports'), exist_ok=True)

            # Create temporary file using DocumentationGenerator
            try:
                logger.info("CreateTempDocumentView: Initializing DocumentationGenerator")
                generator = DocumentationGenerator()
                
                logger.info("CreateTempDocumentView: Starting document creation")
                temp_file = generator.create_temporary_file(
                    content=doc_content,
                    export_format=export_format,
                    filename=filename if filename else f'documentation_{int(time.time())}'
                )
                logger.info(f"CreateTempDocumentView: Document created successfully at {temp_file}")
            except ImportError as e:
                logger.error(f"CreateTempDocumentView: Missing dependency - {str(e)}")
                return Response({
                    'status': 'error',
                    'message': f'Required package not installed: {str(e)}',
                    'error_type': 'dependency_error'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Exception as e:
                logger.error(f"CreateTempDocumentView: Document creation failed - {str(e)}")
                return Response({
                    'status': 'error',
                    'message': f'Document creation failed: {str(e)}',
                    'error_type': 'generation_error'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Generate download URL for the temporary file
            relative_path = os.path.relpath(temp_file, settings.MEDIA_ROOT)
            download_url = f'{settings.MEDIA_URL}{relative_path}'.replace('\\', '/')

            return Response({
                'status': 'success',
                'download_url': download_url,
                'filename': os.path.basename(temp_file)
            })

        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Failed to create temporary file: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AIStatusView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            status = check_system_status()
            
            return Response({
                'status': 'operational',
                'message': 'AI documentation generation is available',
                'capabilities': [
                    'Single file documentation',
                    'Full project analysis',
                    'Multi-language support',
                    'Quality metrics'
                ]
            })
            
        except Exception as e:
            return Response({
                'status': 'limited',
                'message': 'AI generation available with basic features',
                'note': 'Some advanced features may be unavailable'
            })
        
class CodeFileListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        """List all uploaded code files"""
        try:
            # Get user_id from query parameters if provided
            user_id = request.GET.get('user_id')
            
            if user_id:
                # Filter files by user (through documentation ownership)
                code_files = CodeFile.objects.filter(
                    documentation__owner_id=user_id
                ).distinct().order_by('-uploaded_at')
                
                # If no files found for this user, include files with no owner (legacy data)
                if not code_files.exists():
                    code_files = CodeFile.objects.filter(
                        documentation__owner_id__isnull=True
                    ).distinct().order_by('-uploaded_at')
            else:
                # Return all files if no user filter is provided
                code_files = CodeFile.objects.all().order_by('-uploaded_at')
            
            files_data = []
            for code_file in code_files:
                # Get related documentation
                documentation = code_file.documentation.first()
                
                files_data.append({
                    'id': code_file.id,
                    'title': code_file.title,
                    'language': code_file.language,
                    'uploaded_at': code_file.uploaded_at.isoformat(),
                    'file_url': code_file.file.url if code_file.file else None,
                    'has_documentation': documentation is not None,
                    'documentation_id': documentation.id if documentation else None
                })
            
            return Response({
                'status': 'success',
                'files': files_data,
                'total_count': len(files_data)
            })
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Error fetching files: {str(e)}'
            }, status=500)

class DocumentationListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        """List all generated documentation"""
        try:
            documentations = Documentation.objects.all().order_by('-generated_at')
            
            docs_data = []
            for doc in documentations:
                docs_data.append({
                    'id': doc.id,
                    'code_file_title': doc.code_file.title,
                    'code_file_language': doc.code_file.language,
                    'generated_at': doc.generated_at.isoformat(),
                    'file_path': doc.file_path,
                    'format': doc.format,
                    'content_preview': doc.content[:200] + '...' if len(doc.content) > 200 else doc.content
                })
            
            return Response({
                'status': 'success',
                'documentation': docs_data,
                'total_count': len(docs_data)
            })
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Error fetching documentation: {str(e)}'
            }, status=500)

class DocumentationDetailView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, doc_id):
        """Get full documentation content"""
        try:
            documentation = Documentation.objects.get(id=doc_id)
            
            return Response({
                'status': 'success',
                'documentation': {
                    'id': documentation.id,
                    'code_file_title': documentation.code_file.title,
                    'code_file_language': documentation.code_file.language,
                    'generated_at': documentation.generated_at.isoformat(),
                    'file_path': documentation.file_path,
                    'format': documentation.format,
                    'content': documentation.content
                }
            })
            
        except Documentation.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Documentation not found'
            }, status=404)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Error fetching documentation: {str(e)}'
            }, status=500)

class StatsView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get documentation statistics"""
        try:
            total_files = CodeFile.objects.count()
            total_docs = Documentation.objects.count()
            
            # Count by language
            language_stats = {}
            for code_file in CodeFile.objects.all():
                lang = code_file.language
                if lang in language_stats:
                    language_stats[lang] += 1
                else:
                    language_stats[lang] = 1
            
            return Response({
                'status': 'success',
                'stats': {
                    'total_files': total_files,
                    'total_documentation': total_docs,
                    'files_with_documentation': CodeFile.objects.filter(documentation__isnull=False).count(),
                    'language_breakdown': language_stats
                }
            })
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Error fetching stats: {str(e)}'
            }, status=500)

class DownloadFileView(APIView):
    """
    Download exported files
    """
    permission_classes = [AllowAny]  # Allow downloads without authentication for temporary files
    
    def get(self, request, file_path):
        """Download a file by its path"""
        try:
            # Ensure the file path is within the media directory for security
            media_root = str(settings.MEDIA_ROOT)  # Convert to string if it's a Path object
            full_path = os.path.join(media_root, file_path)
            
            # Security check: ensure file is within media directory
            if not str(full_path).startswith(media_root):
                return Response({'error': 'Invalid file path'}, status=400)
            
            # Check if file exists
            if not os.path.exists(full_path):
                return Response({'error': 'File not found'}, status=404)
            
            # Determine content type based on file extension
            content_type_map = {
                '.pdf': 'application/pdf',
                '.html': 'text/html',
                '.md': 'text/markdown',
                '.txt': 'text/plain',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            }
            
            file_ext = os.path.splitext(full_path)[1].lower()
            content_type = content_type_map.get(file_ext, 'application/octet-stream')
            
            # Read and serve the file
            with open(full_path, 'rb') as f:
                response = HttpResponse(f.read(), content_type=content_type)
                response['Content-Disposition'] = f'attachment; filename="{os.path.basename(full_path)}"'
                return response
                
        except Exception as e:
            return Response({'error': f'Error downloading file: {str(e)}'}, status=500)

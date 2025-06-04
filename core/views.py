from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.http import Http404
import os
import zipfile
import tempfile
import shutil
import json
import traceback
from typing import Dict, List, Any
from .utils.code_parser import parse_codebase
from .utils.llm_integration import generate_documentation_with_retry

class UploadCodeView(APIView):
    """
    API endpoint for uploading single code files and generating documentation.
    """
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        print("UploadCodeView received request:", request)
        print("Request FILES:", request.FILES)
        print("Request data:", request.data)
        
        if 'file' not in request.FILES:
            print("No file in request.FILES")
            return Response({'status': 'error', 'message': 'No file provided'}, status=400)
            
        uploaded_file = request.FILES['file']
        print(f"File received: {uploaded_file.name}, size: {uploaded_file.size} bytes")
          # Create directories if they don't exist
        os.makedirs('media', exist_ok=True)
        os.makedirs('docs_output', exist_ok=True)
        
        save_path = f'media/{uploaded_file.name}'
        # Save the uploaded file
        try:
            with open(save_path, 'wb+') as f:
                for chunk in uploaded_file.chunks():
                    f.write(chunk)
            
            print(f"File saved successfully at {save_path}")
                    
            # Check if it's Python file for now (will be expanded to support more languages)
            if save_path.endswith('.py'):
                try:
                    print(f"Starting to parse file: {save_path}")
                    doc_content, generator = parse_codebase(save_path)
                    print(f"Successfully parsed file. Generator: {generator}")
                    
                    # Make sure we always return a valid generator type
                    if generator not in ['deepseek', 'ast', 'error']:
                        print(f"Warning: Unknown generator type '{generator}', defaulting to 'ast'")
                        generator = 'ast'
                    
                    doc_path = f'docs_output/{uploaded_file.name}_doc.md'
                    
                    with open(doc_path, 'w', encoding='utf-8') as f:
                        f.write(doc_content)
                        
                    print(f"Documentation saved to {doc_path}")
                    
                    return Response({
                        'status': 'success', 
                        'doc': doc_content,
                        'doc_path': doc_path,
                        'file_name': uploaded_file.name,
                        'generator': generator
                    })
                except Exception as e:
                    print(f"Error during code parsing: {str(e)}")
                    import traceback
                    traceback_str = traceback.format_exc()
                    print(traceback_str)
                    
                    # Create an error document
                    error_doc = f"# Error in Documentation Generation\n\nAn error occurred while parsing the file: {str(e)}\n\n"
                      # Return a more informative error response with the error doc
                    return Response({
                        'status': 'partial_success',
                        'doc': error_doc,
                        'file_name': uploaded_file.name,
                        'generator': 'error',
                        'error_message': f'Error generating documentation: {str(e)}'
                    })
        except Exception as e:
            print(f"Error saving file: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return Response({
                'status': 'error',
                'message': f'Error saving uploaded file: {str(e)}'
            }, status=500)
        else:
            return Response({
                'status': 'error',
                'message': 'Currently only Python (.py) files are supported'
            }, status=400)


class UploadProjectView(APIView):
    """
    API endpoint for uploading project folders (as zip files) and generating documentation.
    """
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if 'file' not in request.FILES:
            return Response({'status': 'error', 'message': 'No file provided'}, status=400)
            
        uploaded_file = request.FILES['file']
        
        # Check if the uploaded file is a ZIP
        if not uploaded_file.name.endswith('.zip'):
            return Response({'status': 'error', 'message': 'Please upload a ZIP file for project documentation'}, status=400)
            
        # Create directories if they don't exist
        os.makedirs('media/projects', exist_ok=True)
        os.makedirs('docs_output/projects', exist_ok=True)
        
        # Generate a unique project directory name based on the zip filename
        project_name = os.path.splitext(uploaded_file.name)[0]
        project_dir = f'media/projects/{project_name}'
        docs_dir = f'docs_output/projects/{project_name}'
        
        # Create project directories
        os.makedirs(project_dir, exist_ok=True)
        os.makedirs(docs_dir, exist_ok=True)
        
        # Save the zip file
        zip_path = f'{project_dir}/{uploaded_file.name}'
        with open(zip_path, 'wb+') as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)
                
        # Extract the zip file
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(project_dir)
                
            # Process all Python files in the project
            project_docs = self._process_project(project_dir, docs_dir)
            
            # Create an index file for the project documentation
            index_path = f'{docs_dir}/index.md'
            with open(index_path, 'w') as f:
                f.write(f"# Documentation for {project_name}\n\n")
                f.write("## Files\n\n")
                for doc in project_docs:
                    rel_path = os.path.relpath(doc['file_path'], project_dir)
                    doc_rel_path = os.path.relpath(doc['doc_path'], docs_dir)
                    f.write(f"- [{rel_path}]({doc_rel_path})\n")
                    
            return Response({
                'status': 'success',
                'message': f'Project documentation generated for {project_name}',
                'doc_index': index_path,
                'files_processed': len(project_docs)
            })
                
        except Exception as e:
            # Clean up on error
            if os.path.exists(project_dir):
                shutil.rmtree(project_dir)
            if os.path.exists(docs_dir):
                shutil.rmtree(docs_dir)
            return Response({'status': 'error', 'message': f'Error processing project: {str(e)}'}, status=500)
    def _process_project(self, project_dir: str, docs_dir: str) -> List[Dict[str, str]]:
        """
        Process all Python files in the project directory.
        
        Args:
            project_dir: Path to the extracted project directory
            docs_dir: Path where documentation should be saved
            
        Returns:
            List of dictionaries containing file paths and doc paths
        """
        docs = []
        
        # Walk through the project directory
        for root, _, files in os.walk(project_dir):
            for file in files:
                if file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    
                    # Generate relative path for documentation
                    rel_path = os.path.relpath(file_path, project_dir)
                    doc_file = f"{os.path.splitext(rel_path)[0].replace('/', '_')}_doc.md"
                    doc_path = os.path.join(docs_dir, doc_file)
                    
                    # Generate documentation for this file
                    try:
                        doc_content, generator = parse_codebase(file_path)
                        
                        # Save documentation
                        with open(doc_path, 'w') as f:
                            f.write(doc_content)
                            
                        docs.append({
                            'file_path': file_path,
                            'doc_path': doc_path,
                            'generator': generator
                        })
                    except Exception as e:
                        # Log error but continue processing other files
                        print(f"Error processing {file_path}: {str(e)}")
                        
        return docs
    
class GenerateDocsView(APIView):
    """
    API endpoint for generating documentation for already uploaded files.
    Useful when changing documentation options without re-uploading files.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        file_path = request.data.get('file_path')
        
        if not file_path:
            return Response({'status': 'error', 'message': 'No file path provided'}, status=400)
            
        # Ensure the file exists and is in the media directory
        if not os.path.exists(file_path) or not file_path.startswith('media/'):
            return Response({'status': 'error', 'message': 'Invalid file path'}, status=400)
              # Generate documentation
        try:
            doc_content, generator = parse_codebase(file_path)
            doc_path = f'docs_output/{os.path.basename(file_path)}_doc.md'
            
            with open(doc_path, 'w') as f:
                f.write(doc_content)
                
            return Response({
                'status': 'success',
                'doc': doc_content,
                'doc_path': doc_path,
                'file_name': os.path.basename(file_path),
                'generator': generator
            })
        except Exception as e:
            return Response({'status': 'error', 'message': f'Error generating documentation: {str(e)}'}, status=500)


class ExportDocsView(APIView):
    """
    API endpoint for exporting documentation in different formats.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        doc_path = request.query_params.get('doc_path')
        export_format = request.query_params.get('format', 'md')
        
        if not doc_path or not os.path.exists(doc_path):
            return Response({'status': 'error', 'message': 'Invalid document path'}, status=400)
            
        try:
            with open(doc_path, 'r') as f:
                content = f.read()
                
            if export_format == 'md':
                # Already in markdown format
                return Response({'status': 'success', 'content': content, 'format': 'markdown'})
                
            elif export_format == 'html':
                # Use the document exporter for HTML conversion
                from .utils.document_export import DocumentExporter
                temp_file = DocumentExporter.create_temporary_file(content, 'html')
                with open(temp_file, 'r', encoding='utf-8') as f:
                    html_content = f.read()
                return Response({'status': 'success', 'content': html_content, 'format': 'html'})
            
            elif export_format in ['pdf', 'docx']:
                # Use the document exporter for PDF and DOCX
                from .utils.document_export import DocumentExporter
                temp_file = DocumentExporter.create_temporary_file(content, export_format)
                # Return file URL for download
                file_url = f'/media/temp/{os.path.basename(temp_file)}'
                return Response({
                    'status': 'success', 
                    'download_url': file_url, 
                    'format': export_format
                })
                
            else:
                return Response({'status': 'error', 'message': f'Unsupported export format: {export_format}'}, status=400)
                
        except Exception as e:
            return Response({'status': 'error', 'message': f'Error exporting documentation: {str(e)}'}, status=500)
    
    def post(self, request):
        """Handle creating a temporary document for export from raw content"""
        content = request.data.get('content')
        export_format = request.data.get('format', 'pdf')
        
        if not content:
            return Response({'status': 'error', 'message': 'No content provided'}, status=400)
        
        try:
            # Import the document exporter
            from .utils.document_export import DocumentExporter
            
            # Generate the document
            temp_file = DocumentExporter.create_temporary_file(content, export_format)
            
            # Return the download URL
            file_url = f'/media/temp/{os.path.basename(temp_file)}'
            return Response({
                'status': 'success',
                'download_url': file_url,
                'format': export_format
            })
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'status': 'error', 'message': f'Error creating {export_format} document: {str(e)}'}, status=500)

class AIStatusView(APIView):
    """
    API endpoint to check the status of AI integration.
    """
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Import here to avoid circular imports
        from .utils.llm_integration import DEEPSEEK_API_KEY
        
        status = {
            "ai_integration": "enabled" if DEEPSEEK_API_KEY and len(DEEPSEEK_API_KEY) > 10 else "disabled",
            "provider": "DeepSeek AI via OpenRouter API",
            "model": "deepseek/deepseek-r1-0528"
        }
        
        return Response(status)
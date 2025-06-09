"""
Views for CodeDocGen API
"""
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
import requests
from typing import Dict, List, Any
from .utils.code_parser import parse_codebase
from .utils import generate_documentation_with_retry, check_openrouter_api_status, OPENROUTER_API_KEY


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
                    if generator not in ['openrouter', 'ast', 'error']:
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
                'message': f'Error saving file: {str(e)}'
            }, status=500)


class UploadProjectView(APIView):
    """
    API endpoint for uploading project folders (as zip files) and generating documentation.
    """
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            if 'file' not in request.FILES:
                return Response({'error': 'No file provided'}, status=400)
            
            uploaded_file = request.FILES['file']
            
            if not uploaded_file.name.endswith('.zip'):
                return Response({'error': 'Only ZIP files are supported'}, status=400)
            
            # Create a temporary directory for extraction
            temp_dir = tempfile.mkdtemp()
            zip_path = os.path.join(temp_dir, uploaded_file.name)
            
            # Save the uploaded zip file
            with open(zip_path, 'wb+') as f:
                for chunk in uploaded_file.chunks():
                    f.write(chunk)
            
            # Extract the zip file
            extract_dir = os.path.join(temp_dir, 'extracted')
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
            
            # Find all Python files in the extracted directory
            python_files = []
            for root, dirs, files in os.walk(extract_dir):
                for file in files:
                    if file.endswith('.py'):
                        file_path = os.path.join(root, file)
                        rel_path = os.path.relpath(file_path, extract_dir)
                        python_files.append({
                            'path': file_path,
                            'relative_path': rel_path,
                            'name': file
                        })
            
            if not python_files:
                # Clean up temporary directory
                shutil.rmtree(temp_dir)
                return Response({'error': 'No Python files found in the uploaded project'}, status=400)
            
            # Generate documentation for each Python file
            docs = {}
            errors = []
            
            for file_info in python_files:
                try:
                    doc_content, generator = parse_codebase(file_info['path'])
                    docs[file_info['relative_path']] = {
                        'content': doc_content,
                        'generator': generator,
                        'file_name': file_info['name']
                    }
                except Exception as e:
                    errors.append({
                        'file': file_info['relative_path'],
                        'error': str(e)
                    })
            
            # Create a project documentation directory
            project_name = uploaded_file.name.replace('.zip', '')
            project_doc_dir = f'docs_output/projects/{project_name}'
            os.makedirs(project_doc_dir, exist_ok=True)
            
            # Save individual documentation files
            for rel_path, doc_info in docs.items():
                doc_filename = rel_path.replace('.py', '_doc.md').replace('/', '_')
                doc_path = os.path.join(project_doc_dir, doc_filename)
                
                with open(doc_path, 'w', encoding='utf-8') as f:
                    f.write(doc_info['content'])
            
            # Create a master documentation file
            master_doc_content = f"# Project Documentation: {project_name}\n\n"
            master_doc_content += f"Generated documentation for {len(docs)} Python files.\n\n"
            
            for rel_path, doc_info in docs.items():
                master_doc_content += f"## {rel_path}\n\n"
                master_doc_content += f"Generator: {doc_info['generator']}\n\n"
                master_doc_content += "---\n\n"
            
            master_doc_path = os.path.join(project_doc_dir, 'README.md')
            with open(master_doc_path, 'w', encoding='utf-8') as f:
                f.write(master_doc_content)
            
            # Clean up temporary directory
            shutil.rmtree(temp_dir)
            
            return Response({
                'status': 'success',
                'project_name': project_name,
                'files_processed': len(docs),
                'errors': errors,
                'docs_directory': project_doc_dir,
                'master_doc_path': master_doc_path
            })
            
        except Exception as e:
            # Clean up in case of error
            if 'temp_dir' in locals():
                shutil.rmtree(temp_dir, ignore_errors=True)
            
            return Response({
                'status': 'error',
                'message': f'Error processing project: {str(e)}'
            }, status=500)


class GenerateDocsView(APIView):
    """
    API endpoint for generating documentation from uploaded files.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # This endpoint can be used for custom documentation generation logic
        return Response({'message': 'Documentation generation endpoint'})


class ExportDocsView(APIView):
    """
    API endpoint for exporting documentation in different formats.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            from .utils.document_export import DocumentExporter
            
            content = request.data.get('content', '')
            export_format = request.data.get('format', 'pdf')
            
            if not content:
                return Response({'status': 'error', 'message': 'No content provided'}, status=400)
            
            if export_format not in ['pdf', 'html', 'docx']:
                return Response({'status': 'error', 'message': 'Invalid format. Supported: pdf, html, docx'}, status=400)
            
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
        from .utils.llm_integration import check_openrouter_api_status, OPENROUTER_API_KEY
        
        openrouter_available = check_openrouter_api_status()
        
        status = {
            "ai_integration": "enabled" if openrouter_available else "disabled",
            "primary_provider": "OpenRouter (DeepSeek)",
            "fallback_provider": None,
            "openrouter_status": "available" if openrouter_available else "unavailable",
            "openrouter_key_configured": OPENROUTER_API_KEY is not None,
            "model": "deepseek/deepseek-r1 (OpenRouter)"
        }
        
        return Response(status)


class AskDeepSeekView(APIView):
    """
    API endpoint to ask DeepSeek questions using OpenRouter API.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Handle DeepSeek chat requests using OpenRouter.
        """
        try:
            prompt = request.data.get('prompt', '')
            if not prompt:
                return Response({'error': 'Prompt is required'}, status=400)
            
            # Import here to avoid circular imports
            from .utils.llm_integration import OPENROUTER_API_KEY
            
            if not OPENROUTER_API_KEY or not OPENROUTER_API_KEY.startswith("sk-or-"):
                return Response({
                    'error': 'OpenRouter API key not configured',
                    'details': 'Please configure your OpenRouter API key'
                }, status=500)

            # Make the API call to OpenRouter
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:8000",
                    "X-Title": "CodeDocGen"
                },
                json={
                    "model": "deepseek/deepseek-r1",
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "max_tokens": 1000,
                    "temperature": 0.7,
                },
                timeout=30
            )

            if response.status_code != 200:
                return Response({
                    'error': 'OpenRouter API request failed', 
                    'details': response.text
                }, status=500)

            result = response.json()
            answer = result["choices"][0]["message"]["content"]
            
            if not answer:
                return Response({
                    'error': 'Empty response from OpenRouter',
                    'details': 'The API returned an empty response'
                }, status=500)

            return Response({'answer': answer})

        except requests.exceptions.Timeout:
            return Response({
                'error': 'OpenRouter request timed out',
                'details': 'The request took too long to process'
            }, status=408)
        except requests.exceptions.RequestException as e:
            return Response({
                'error': 'Network error',
                'details': f'Failed to connect to OpenRouter: {str(e)}'
            }, status=500)
        except KeyError as e:
            return Response({
                'error': 'Invalid response format',
                'details': f'Unexpected response structure: {str(e)}'
            }, status=500)
        except Exception as e:
            return Response({
                'error': 'Unexpected error',
                'details': str(e)
            }, status=500)

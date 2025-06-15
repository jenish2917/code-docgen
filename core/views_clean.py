from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
import os
import zipfile
import tempfile
import shutil
import traceback
from typing import Dict, List, Any
from .utils.code_parser import parse_codebase
from .utils.llm_integration import generate_documentation, check_system_status
from .utils.project_documentation_generator import ProjectDocumentationGenerator

class UploadCodeView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = []
    
    def post(self, request):
        if 'file' not in request.FILES:
            return Response({'status': 'error', 'message': 'No file provided'}, status=400)
            
        uploaded_file = request.FILES['file']
        
        os.makedirs('media', exist_ok=True)
        os.makedirs('docs_output', exist_ok=True)
        
        save_path = f'media/{uploaded_file.name}'
        
        try:
            with open(save_path, 'wb+') as f:
                for chunk in uploaded_file.chunks():
                    f.write(chunk)
            
            if save_path.endswith('.py'):
                try:
                    doc_content, generator = parse_codebase(save_path)
                    doc_path = f'docs_output/{uploaded_file.name}_doc.md'
                    
                    with open(doc_path, 'w', encoding='utf-8') as f:
                        f.write(doc_content)
                    
                    return Response({
                        'status': 'success', 
                        'documentation': doc_content,
                        'filename': uploaded_file.name,
                        'message': 'Documentation generated successfully'
                    })
                except Exception as e:
                    return Response({
                        'status': 'error',
                        'message': f'Error generating documentation: {str(e)}'
                    }, status=500)
                    
        except Exception as e:
            return Response({
                'status': 'error', 
                'message': f'Error saving file: {str(e)}'
            }, status=500)

class UploadProjectView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = []
    
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
    permission_classes = []
    
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
    permission_classes = []
    
    def post(self, request):
        if 'files' not in request.FILES:
            return Response({'status': 'error', 'message': 'No files provided'}, status=400)
        
        files = request.FILES.getlist('files')
        results = []
        
        os.makedirs('media', exist_ok=True)
        os.makedirs('docs_output', exist_ok=True)
        
        for uploaded_file in files:
            try:
                save_path = f'media/{uploaded_file.name}'
                
                with open(save_path, 'wb+') as f:
                    for chunk in uploaded_file.chunks():
                        f.write(chunk)
                
                if save_path.endswith('.py'):
                    try:
                        doc_content, generator = parse_codebase(save_path)
                        doc_path = f'docs_output/{uploaded_file.name}_doc.md'
                        
                        with open(doc_path, 'w', encoding='utf-8') as f:
                            f.write(doc_content)
                        
                        results.append({
                            'filename': uploaded_file.name,
                            'status': 'success',
                            'documentation': doc_content[:500] + '...' if len(doc_content) > 500 else doc_content,
                            'doc_path': doc_path
                        })
                    except Exception as e:
                        results.append({
                            'filename': uploaded_file.name,
                            'status': 'error',
                            'message': f'Error generating documentation: {str(e)}'
                        })
                else:
                    results.append({
                        'filename': uploaded_file.name,
                        'status': 'skipped',
                        'message': 'Only Python files are supported'
                    })
                    
            except Exception as e:
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
    permission_classes = []
    
    def post(self, request):
        if 'files' not in request.FILES:
            return Response({'status': 'error', 'message': 'No files provided'}, status=400)
        
        files = request.FILES.getlist('files')
        folder_name = request.data.get('folder_name', 'uploaded_folder')
        
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
                
                if save_path.endswith('.py'):
                    try:
                        doc_content, generator = parse_codebase(save_path)
                        doc_filename = relative_path.replace('/', '_').replace('\\', '_')
                        doc_path = f'docs_output/{folder_name}_{doc_filename}_doc.md'
                        
                        with open(doc_path, 'w', encoding='utf-8') as f:
                            f.write(doc_content)
                        
                        results.append({
                            'filename': relative_path,
                            'status': 'success',
                            'documentation': doc_content[:300] + '...' if len(doc_content) > 300 else doc_content,
                            'doc_path': doc_path
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
    permission_classes = []
    
    def post(self, request):
        doc_content = request.data.get('doc_content', '')
        filename = request.data.get('filename', 'documentation')
        
        if not doc_content:
            return Response({'status': 'error', 'message': 'No documentation content provided'}, status=400)
        
        try:
            export_path = f'docs_output/{filename}.md'
            
            with open(export_path, 'w', encoding='utf-8') as f:
                f.write(doc_content)
            
            return Response({
                'status': 'success',
                'message': 'Documentation exported successfully',
                'export_path': export_path,
                'filename': f'{filename}.md'
            })
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Error exporting documentation: {str(e)}'
            }, status=500)

class AIStatusView(APIView):
    permission_classes = []
    
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

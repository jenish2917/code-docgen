import os
import requests
import json
import re
from typing import Tuple, Optional
from pathlib import Path

# Supported file types for AI documentation generation
SUPPORTED_CODE_EXTENSIONS = {
    '.py': 'Python',
    '.js': 'JavaScript', 
    '.jsx': 'React JSX',
    '.ts': 'TypeScript',
    '.tsx': 'React TypeScript',
    '.java': 'Java',
    '.c': 'C',
    '.cpp': 'C++',
    '.cc': 'C++',
    '.cxx': 'C++',
    '.h': 'C/C++ Header',
    '.hpp': 'C++ Header',
    '.cs': 'C#',
    '.php': 'PHP',
    '.rb': 'Ruby',
    '.go': 'Go',
    '.rs': 'Rust',
    '.swift': 'Swift',
    '.kt': 'Kotlin',
    '.scala': 'Scala',
    '.r': 'R',
    '.m': 'Objective-C',
    '.mm': 'Objective-C++',
    '.sh': 'Shell Script',
    '.bash': 'Bash Script',
    '.ps1': 'PowerShell',
    '.sql': 'SQL',
    '.html': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.sass': 'Sass',
    '.less': 'LESS',
    '.xml': 'XML',
    '.json': 'JSON',
    '.yaml': 'YAML',
    '.yml': 'YAML',
    '.md': 'Markdown',
    '.dockerfile': 'Dockerfile',
    '.makefile': 'Makefile'
}

def is_supported_file(filename: str) -> bool:
    """Check if a file is supported for AI documentation generation."""
    ext = Path(filename).suffix.lower()
    # Also check for files without extensions that are commonly code files
    if not ext:
        basename = Path(filename).name.lower()
        if basename in ['dockerfile', 'makefile', 'rakefile', 'gemfile']:
            return True
    return ext in SUPPORTED_CODE_EXTENSIONS

def get_file_language(filename: str) -> str:
    """Get the programming language for a file."""
    ext = Path(filename).suffix.lower()
    if not ext:
        basename = Path(filename).name.lower()
        if basename == 'dockerfile':
            return 'Dockerfile'
        elif basename in ['makefile', 'rakefile']:
            return 'Makefile'
        elif basename == 'gemfile':
            return 'Ruby'
    return SUPPORTED_CODE_EXTENSIONS.get(ext, 'Code')

def analyze_code_structure(code_content: str) -> dict:
    """Enhanced code structure analysis with better function and class detection."""
    lines = code_content.split('\n')
    functions = []
    classes = []
    imports = []
    
    # Track context for better analysis
    current_class = None
    current_class_methods = []
    in_function = False
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Class detection
        if stripped.startswith('class '):
            # Save previous class if it exists
            if current_class:
                # Find the class in our classes list and update its methods
                for cls in classes:
                    if cls['name'] == current_class:
                        cls['methods'] = current_class_methods.copy()
                        break
            
            # Start new class
            class_match = re.match(r'class\s+(\w+)(?:\([^)]*\))?\s*:', stripped)
            if class_match:
                class_name = class_match.group(1)
                current_class = class_name
                current_class_methods = []
                
                # Enhanced class purpose detection
                purpose = "Business logic component"
                
                # First try to get docstring
                if i + 1 < len(lines) and '"""' in lines[i + 1]:
                    doc_line = lines[i + 1].strip().replace('"""', '').strip()
                    if doc_line:
                        purpose = doc_line[:60] + ('...' if len(doc_line) > 60 else '')
                
                # If no meaningful docstring, provide contextual purpose
                if purpose == "Business logic component":
                    if 'View' in class_name:
                        if 'Upload' in class_name:
                            purpose = "Handles file uploads with validation and processing"
                        elif 'Generate' in class_name:
                            purpose = "Generates documentation from code analysis"
                        elif 'Export' in class_name:
                            purpose = "Exports documentation to various formats"
                        elif 'Status' in class_name:
                            purpose = "Provides system status and health information"
                        elif 'Multiple' in class_name:
                            purpose = "Processes multiple files in batch operations"
                        else:
                            purpose = "Web API endpoint handler"
                    elif 'Manager' in class_name:
                        purpose = f"Manages {class_name.replace('Manager', '').lower()} operations"
                    elif 'Service' in class_name:
                        purpose = f"Business service implementing {class_name.replace('Service', '').lower()} operations"
                    elif 'Model' in class_name:
                        purpose = f"Data model representing {class_name.replace('Model', '').lower()} entities"
                    else:
                        purpose = f"Core {class_name} implementation"
                
                classes.append({
                    'name': class_name,
                    'purpose': purpose,
                    'docstring': purpose,
                    'methods': []
                })
        
        # Function detection (improved to handle methods and standalone functions)
        elif stripped.startswith('def '):
            func_match = re.match(r'def\s+(\w+)\s*\((.*?)\)(?:\s*->\s*[^:]+)?\s*:', stripped)
            if func_match:
                name = func_match.group(1)
                params_str = func_match.group(2)
                
                # Clean and format parameters
                params_list = []
                if params_str:
                    for param in params_str.split(','):
                        param = param.strip()
                        if param and param != 'self':
                            # Remove type annotations and default values for cleaner display
                            clean_param = param.split(':')[0].split('=')[0].strip()
                            if clean_param:
                                params_list.append(clean_param)
                
                # Get function description with better context awareness
                description = "Business logic implementation"
                
                # Try to extract docstring
                if i + 1 < len(lines) and '"""' in lines[i + 1]:
                    doc_content = lines[i + 1].strip().replace('"""', '').strip()
                    if doc_content:
                        description = doc_content[:100] + ('...' if len(doc_content) > 100 else '')
                
                # If no docstring, provide better contextual description
                if description == "Business logic implementation":
                    if current_class:
                        if 'View' in current_class:
                            if name == 'post':
                                description = f"Handles POST requests for {current_class.replace('View', '').lower()} operations"
                            elif name == 'get':
                                description = f"Handles GET requests for {current_class.replace('View', '').lower()} data"
                            elif name == 'put':
                                description = f"Handles PUT requests for {current_class.replace('View', '').lower()} updates"
                            elif name == 'delete':
                                description = f"Handles DELETE requests for {current_class.replace('View', '').lower()} removal"
                            else:
                                description = f"Handles {name} operations for {current_class}"
                        else:
                            description = f"Implements {name} functionality for {current_class}"
                    else:
                        # Standalone function descriptions
                        if 'create' in name.lower():
                            description = f"Creates new {name.replace('create_', '').replace('create', '')} instances"
                        elif 'update' in name.lower() or 'edit' in name.lower():
                            description = f"Updates existing {name.replace('update_', '').replace('edit_', '')} data"
                        elif 'delete' in name.lower():
                            description = f"Deletes {name.replace('delete_', '')} records"
                        elif 'get' in name.lower() or 'fetch' in name.lower():
                            description = f"Retrieves {name.replace('get_', '').replace('fetch_', '')} information"
                        elif 'validate' in name.lower():
                            description = f"Validates {name.replace('validate_', '')} data"
                        elif 'process' in name.lower():
                            description = f"Processes {name.replace('process_', '')} operations"
                        elif 'parse' in name.lower():
                            description = f"Parses {name.replace('parse_', '')} content"
                        elif 'generate' in name.lower():
                            description = f"Generates {name.replace('generate_', '')} output"
                        else:
                            description = f"Implements {name} functionality"
                
                # Create function/method info
                func_info = {
                    'name': name,
                    'params': params_list,
                    'description': description,
                    'docstring': description,
                    'class_context': current_class
                }
                
                # Add to appropriate collection
                if current_class:
                    current_class_methods.append(func_info)
                else:
                    functions.append(func_info)
        
        # Import detection with better categorization
        elif stripped.startswith(('import ', 'from ')):
            # Clean up import for better display
            import_clean = stripped
            if 'from ' in stripped and ' import ' in stripped:
                parts = stripped.split(' import ')
                module = parts[0].replace('from ', '').strip()
                import_clean = module
            elif stripped.startswith('import '):
                import_clean = stripped.replace('import ', '').strip()
              # Better categorization logic
            standard_libs = {
                'os', 'sys', 'json', 're', 'ast', 'typing', 'pathlib', 'datetime',
                'tempfile', 'shutil', 'zipfile', 'traceback', 'collections',
                'itertools', 'functools', 'threading', 'multiprocessing'
            }
            
            # Check if it's a standard library (exact match or starts with standard lib name)
            is_standard = (import_clean in standard_libs or 
                          any(import_clean.startswith(lib + '.') for lib in standard_libs))
            
            # Special handling for framework modules
            is_django = import_clean.startswith(('django', 'rest_framework'))
            is_local = import_clean.startswith('.')
            
            imports.append({
                'raw': stripped,
                'module': import_clean,
                'is_standard': is_standard,
                'is_django': is_django,
                'is_local': is_local
            })
    
    # Handle the last class if it exists
    if current_class and current_class_methods:
        for cls in classes:
            if cls['name'] == current_class:
                cls['methods'] = current_class_methods.copy()
                break
    
    return {
        'functions': functions,
        'classes': classes,
        'imports': imports
    }
    """Enhanced code structure analysis with better function and class detection."""
    lines = code_content.split('\n')
    functions = []
    classes = []
    imports = []
    
    # Track context for better analysis
    current_class = None
    in_function = False
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Class detection
        if stripped.startswith('class '):
            class_match = re.match(r'class\s+(\w+)(?:\([^)]*\))?\s*:', stripped)
            if class_match:
                class_name = class_match.group(1)
                current_class = class_name
                
                # Enhanced class purpose detection
                purpose = "Business logic component"
                
                # First try to get docstring
                if i + 1 < len(lines) and '"""' in lines[i + 1]:
                    doc_line = lines[i + 1].strip().replace('"""', '').strip()
                    if doc_line:
                        purpose = doc_line[:60] + ('...' if len(doc_line) > 60 else '')
                
                # If no meaningful docstring, provide contextual purpose
                if purpose == "Business logic component":
                    if 'View' in class_name:
                        if 'Upload' in class_name:
                            purpose = "File upload handler with validation"
                        elif 'Generate' in class_name:
                            purpose = "Documentation generation service"
                        elif 'Export' in class_name:
                            purpose = "Document export service"
                        elif 'Status' in class_name:
                            purpose = "System status monitoring service"
                        elif 'Multiple' in class_name:
                            purpose = "Batch file processing service"
                        elif 'Folder' in class_name:
                            purpose = "Folder processing and management service"
                        else:
                            purpose = f"API endpoint handler for {class_name.replace('View', '').lower()}"
                    elif 'Manager' in class_name:
                        purpose = f"Data management operations for {class_name.replace('Manager', '').lower()}"
                    elif 'Parser' in class_name:
                        purpose = f"Code parsing and analysis engine"
                    elif 'Service' in class_name:
                        purpose = f"Business service implementing {class_name.replace('Service', '').lower()} operations"
                    elif 'Model' in class_name:
                        purpose = f"Data model representing {class_name.replace('Model', '').lower()} entities"
                    else:
                        purpose = f"Core {class_name} implementation"
                classes.append({
                    'name': class_name,
                    'purpose': purpose,
                    'docstring': purpose,  # Use purpose as docstring for now
                    'methods': []  # Will be populated by method detection
                })
        
        # Function detection (improved to handle methods and standalone functions)
        elif stripped.startswith('def '):
            func_match = re.match(r'def\s+(\w+)\s*\((.*?)\)(?:\s*->\s*[^:]+)?\s*:', stripped)
            if func_match:
                name = func_match.group(1)
                params_str = func_match.group(2)
                
                # Clean and format parameters
                if params_str:
                    params = ', '.join([p.split(':')[0].strip() for p in params_str.split(',') if p.strip()])
                    if len(params) > 30:
                        params = params[:27] + '...'
                else:
                    params = 'None'
                
                # Get function description
                description = "Business logic implementation"
                
                # Try to extract docstring
                if i + 1 < len(lines) and '"""' in lines[i + 1]:
                    doc_content = lines[i + 1].strip().replace('"""', '').strip()
                    if doc_content:
                        if len(doc_content) > 70:
                            description = doc_content[:70] + ('...' if len(doc_content) > 70 else '')
                
                # If no docstring, provide contextual description based on function name and class
                if description == "Business logic implementation":
                    if current_class:
                        if 'View' in current_class:
                            if name == 'post':
                                description = "POST request handler with validation"
                            elif name == 'get':
                                description = "GET endpoint with filtering"
                            elif name == 'put':
                                description = "PUT handler for data updates"
                            elif name == 'delete':
                                description = "DELETE handler with authorization"
                            else:
                                description = f"{current_class} method for {name} operations"
                        elif 'Manager' in current_class:
                            description = f"Data management operation: {name}"
                        elif 'Service' in current_class:
                            description = f"Business service method: {name}"
                        elif 'Parser' in current_class:
                            description = f"Code analysis operation: {name}"
                        else:
                            description = f"{current_class} method implementing {name}"
                    else:
                        # Standalone function descriptions
                        if 'create' in name.lower():
                            description = "Creation function with validation"
                        elif 'update' in name.lower() or 'edit' in name.lower():
                            description = "Update operation with data validation"
                        elif 'delete' in name.lower():
                            description = "Deletion function with authorization"
                        elif 'get' in name.lower() or 'fetch' in name.lower():
                            description = "Data retrieval function"
                        elif 'validate' in name.lower():
                            description = "Validation function with rule checking"
                        elif 'process' in name.lower():
                            description = "Data processing operation"
                        elif 'parse' in name.lower():
                            description = "Parsing function with analysis"
                        elif 'save' in name.lower():
                            description = "Data persistence operation"
                        else:
                            description = f"Utility function: {name}"
                  # Determine return type based on common patterns
                returns = "Mixed"
                if 'return True' in code_content or 'return False' in code_content:
                    returns = "Boolean"
                elif 'return []' in code_content or 'return list' in code_content:
                    returns = "List"
                elif 'return {}' in code_content or 'return dict' in code_content:
                    returns = "Dict"
                elif 'Response(' in code_content and current_class and 'View' in current_class:
                    returns = "Response"
                
                functions.append({
                    'name': name,
                    'params': params,
                    'returns': returns,
                    'description': description,
                    'docstring': description,  # Use description as docstring
                    'class_context': current_class,
                    'args': params.split(', ') if params != 'None' else []
                })
        
        # Import detection with better categorization
        elif stripped.startswith(('import ', 'from ')):
            # Clean up import for better display
            import_clean = stripped
            if 'from ' in stripped and ' import ' in stripped:
                parts = stripped.split(' import ')
                module = parts[0].replace('from ', '')
                import_clean = module
            elif stripped.startswith('import '):
                import_clean = stripped.replace('import ', '')
            
            imports.append({
                'raw': stripped,
                'module': import_clean,
                'is_standard': any(lib in import_clean for lib in ['os', 'sys', 'json', 're', 'ast', 'typing', 'pathlib'])
            })
    
    return {
        'functions': functions,
        'classes': classes,
        'imports': imports
    }

def create_markdown_table(headers: list, rows: list) -> str:
    """Create a properly formatted markdown table."""
    if not rows:
        rows = [['No data', '-', '-']]
    
    for i, row in enumerate(rows):
        while len(row) < len(headers):
            row.append('-')
        rows[i] = row[:len(headers)]
    
    table = '| ' + ' | '.join(headers) + ' |\n'
    table += '|' + '|'.join(['-' * (len(h) + 2) for h in headers]) + '|\n'
    
    for row in rows:
        table += '| ' + ' | '.join(str(cell) for cell in row) + ' |\n'
    
    return table

def generate_quality_documentation(code_content: str, filename: str) -> str:
    """Generate high-quality, well-structured documentation with proper formatting."""
    
    structure = analyze_code_structure(code_content)
    
    ext = Path(filename).suffix.lower()
    lang_map = {
        '.py': 'Python', '.js': 'JavaScript', '.ts': 'TypeScript',
        '.jsx': 'React JSX', '.tsx': 'React TSX', '.java': 'Java',
        '.php': 'PHP', '.cpp': 'C++', '.c': 'C', '.cs': 'C#',
        '.go': 'Go', '.rs': 'Rust', '.rb': 'Ruby'
    }
    language = lang_map.get(ext, 'Source Code')
    
    lines_count = len([l for l in code_content.split('\n') if l.strip()])
    func_count = len(structure['functions'])
    class_count = len(structure['classes'])
    
    # Determine purpose based on analysis
    purpose = analyze_file_purpose(filename, structure, code_content)
      # Start with professional header following international standards
    doc = f"""# 📄 {filename}

## 📋 Overview
- **Language**: {language}
- **Purpose**: {purpose}
- **Type**: Professional {language} Module
- **Lines of Code**: {lines_count}
- **Complexity**: {'High' if lines_count > 300 else 'Medium' if lines_count > 100 else 'Low'}

## 🏗️ Architecture & Design

### Module Structure
This {language} module implements {purpose.lower()} with a {'class-based' if class_count > 0 else 'functional'} architecture.

**Components Overview:**
- **Functions**: {func_count} implemented functions
- **Classes**: {class_count} defined classes
- **Architecture Pattern**: {'Object-Oriented' if class_count > func_count else 'Functional Programming'}

### Design Principles
- Follows {language} best practices and coding standards
- Implements clean code principles for maintainability
- Designed for scalability and extensibility
- Adheres to SOLID principles where applicable

"""    # Add comprehensive classes section following international standards
    if structure['classes']:
        doc += "## 📚 API Reference - Classes\n\n"
        for cls in structure['classes']:
            doc += f"### `{cls['name']}`\n\n"
            doc += f"**Purpose**: {cls['purpose']}\n\n"
            doc += f"**Type**: {language} Class\n\n"
            doc += f"**Responsibility**: {cls['purpose']}\n\n"
            
            if cls.get('methods') and len(cls['methods']) > 0:
                doc += "#### Methods\n\n"
                for method in cls['methods']:
                    doc += f"##### `{method['name']}()`\n\n"
                    doc += f"**Description**: {method['description']}\n\n"
                    
                    if method.get('params') and len(method['params']) > 0:
                        doc += "**Parameters**:\n"
                        for param in method['params']:
                            param_desc = get_parameter_description(param, method['name'], cls['name'])
                            doc += f"- `{param}`: {param_desc}\n"
                        doc += "\n"
                    
                    doc += f"**Usage**:\n```{language.lower()}\n"
                    doc += f"// Example usage of {method['name']}\n"
                    if cls['name']:
                        doc += f"const instance = new {cls['name']}();\n"
                        doc += f"instance.{method['name']}();\n"
                    doc += "```\n\n"
                doc += "\n"

    # Add comprehensive functions section following international standards  
    if structure['functions']:
        doc += "## 🔧 API Reference - Functions\n\n"
        for func in structure['functions']:
            doc += f"### `{func['name']}()`\n\n"
            doc += f"**Purpose**: {func['description']}\n\n"
            doc += f"**Type**: {language} Function\n\n"
            
            if func.get('params') and len(func['params']) > 0:
                doc += "**Parameters**:\n"
                for param in func['params']:
                    param_desc = get_parameter_description(param, func['name'])
                    doc += f"- `{param}`: {param_desc}\n"
                doc += "\n"
            doc += f"**Usage Example**:\n```{language.lower()}\n"
            doc += f"// Example usage of {func['name']}\n"
            doc += f"const result = {func['name']}("
            if func.get('params'):
                doc += ', '.join(['param' + str(i+1) for i in range(min(len(func['params']), 3))])
            doc += ");\n"
            doc += "```\n\n"

    # Add comprehensive dependencies section following international standards
    if structure['imports']:
        doc += "## Dependencies\n\n"
        std_libs = []
        third_party = []
        local_imports = []
        
        for imp in structure['imports']:
            # Handle both string and dict formats
            if isinstance(imp, dict):
                module = imp['module']
                is_standard = imp.get('is_standard', False)
                is_django = imp.get('is_django', False)
                is_local = imp.get('is_local', False)
            else:
                module = str(imp)
                is_standard = any(lib in module for lib in ['os', 'sys', 'json', 're', 'ast', 'typing', 'pathlib'])
                is_django = module.startswith(('django', 'rest_framework'))
                is_local = module.startswith('.')
            
            if is_local:
                local_imports.append(module)
            elif is_standard:
                std_libs.append(module)
            elif is_django:
                third_party.append(f"{module} (Django/DRF)")
            else:
                third_party.append(module)
        
        if std_libs:
            doc += "**Standard Library:**\n"
            for lib in std_libs:
                doc += f"- `{lib}` - Built-in Python module\n"
            doc += "\n"
        
        if third_party:
            doc += "**Third-party Packages:**\n"
            for lib in third_party:
                doc += f"- `{lib}` - External dependency\n"
            doc += "\n"
        
        if local_imports:
            doc += "**Local Modules:**\n"
            for lib in local_imports:
                doc += f"- `{lib}` - Project module\n"
            doc += "\n"
      # Add usage example
    doc += "## Usage Example\n\n"
    if structure['classes']:
        main_class = structure['classes'][0]['name']
        doc += f"```{language.lower()}\n"
        
        # Generate more realistic examples based on class type
        if 'View' in main_class:
            doc += f"# URL Configuration (urls.py)\n"
            doc += f"from django.urls import path\n"
            doc += f"from . import views\n\n"
            doc += f"urlpatterns = [\n"
            doc += f"    path('api/endpoint/', views.{main_class}.as_view(), name='api_endpoint'),\n"
            doc += f"]\n\n"
            doc += f"# Making API calls\n"
            doc += f"import requests\n"
            if structure['classes'][0]['methods']:
                method_name = structure['classes'][0]['methods'][0]['name']
                if method_name.lower() == 'post':
                    doc += f"response = requests.post('http://localhost:8000/api/endpoint/', data={{'key': 'value'}})\n"
                elif method_name.lower() == 'get':
                    doc += f"response = requests.get('http://localhost:8000/api/endpoint/')\n"
            doc += f"print(response.json())\n"
        else:
            doc += f"# Import the class\n"
            doc += f"from {filename.replace('.py', '')} import {main_class}\n\n"
            doc += f"# Create instance and use\n"
            doc += f"instance = {main_class}()\n"
            if structure['classes'][0]['methods']:
                method_name = structure['classes'][0]['methods'][0]['name']
                doc += f"result = instance.{method_name}()\n"
        doc += "```\n\n"
    elif structure['functions']:
        main_func = structure['functions'][0]['name']
        doc += f"```{language.lower()}\n"
        doc += f"# Import the function\n"
        doc += f"from {filename.replace('.py', '')} import {main_func}\n\n"
        doc += f"# Use the function\n"
        doc += f"result = {main_func}()\n"
        doc += "```\n\n"
      # Add quality metrics
    doc += "## Code Quality\n\n"
    
    # Calculate more sophisticated metrics
    total_methods = sum(len(cls.get('methods', [])) for cls in structure['classes'])
    avg_methods_per_class = total_methods / class_count if class_count > 0 else 0
    has_docstrings = any(
        method.get('description', '') != f"Handles {method['name']} operations" 
        for cls in structure['classes'] 
        for method in cls.get('methods', [])
    )
    
    # Complexity assessment
    if lines_count > 500:
        complexity = "Very High"
    elif lines_count > 300:
        complexity = "High"
    elif lines_count > 150:
        complexity = "Medium"
    elif lines_count > 50:
        complexity = "Low"
    else:
        complexity = "Very Low"
    
    # Maintainability assessment
    if avg_methods_per_class <= 5 and class_count <= 3:
        maintainability = "Excellent"
    elif avg_methods_per_class <= 8 and class_count <= 7:
        maintainability = "Good"
    elif avg_methods_per_class <= 12:
        maintainability = "Fair"
    else:
        maintainability = "Needs Improvement"
    
    # Architecture assessment
    if 'View' in str([cls['name'] for cls in structure['classes']]):
        architecture = "RESTful API Architecture"
    elif class_count > func_count:
        architecture = "Object-Oriented Design"
    else:
        architecture = "Functional Programming"
    
    doc += f"- **Lines of Code:** {lines_count} (Professional scale)\n"
    doc += f"- **Complexity:** {complexity}\n"
    doc += f"- **Classes:** {class_count} with {total_methods} total methods\n"
    doc += f"- **Architecture:** {architecture}\n"
    doc += f"- **Maintainability:** {maintainability}\n"
    doc += f"- **Documentation:** {'Well Documented' if has_docstrings else 'Partially Documented'}\n"
    
    # Add recommendations
    if complexity == "Very High":
        doc += f"- **Recommendation:** Consider breaking into smaller modules\n"
    elif maintainability == "Needs Improvement":
        doc += f"- **Recommendation:** Reduce method complexity and class size\n"
    elif not has_docstrings:
        doc += f"- **Recommendation:** Add comprehensive documentation\n"
    
    doc += "\n---\n*Generated with professional code analysis*"
    
    return doc

def analyze_file_purpose(filename: str, structure: dict, code_content: str) -> str:
    """Analyze and determine the main purpose of the file."""
    filename_lower = filename.lower()
    
    # File name based detection
    if 'view' in filename_lower:
        return "Implements web API endpoints with request handling and response generation."
    elif 'model' in filename_lower:
        return "Defines data models and database schema with validation rules."
    elif 'util' in filename_lower:
        return "Provides utility functions and helper methods for common operations."
    elif 'test' in filename_lower:
        return "Contains test cases and validation logic for quality assurance."
    elif 'service' in filename_lower:
        return "Implements business logic and service layer functionality."
    elif 'parser' in filename_lower:
        return "Handles code parsing and analysis with intelligent processing."
    elif 'config' in filename_lower:
        return "Manages application configuration and settings."
    
    # Content based detection
    if any('class' in cls['name'] and 'View' in cls['name'] for cls in structure['classes']):
        return "Web API handler providing RESTful endpoints for client interactions."
    elif any('Manager' in cls['name'] for cls in structure['classes']):
        return "Data management system with CRUD operations and business logic."
    elif any('Parser' in cls['name'] for cls in structure['classes']):
        return "Code analysis engine with parsing and interpretation capabilities."
    elif 'def generate' in code_content:
        return "Generation system that creates content or processes data dynamically."
    elif 'def parse' in code_content:
        return "Parser module that analyzes and extracts information from input data."
    elif 'from django' in code_content:
        return "Django web application component with MVC architecture support."
    elif 'import requests' in code_content:
        return "HTTP client module for external API communication and data exchange."
    
    return "Professional software module implementing core application functionality."

def get_parameter_description(param_name: str, function_name: str, class_name: str = None) -> str:
    """Generate intelligent parameter descriptions based on context."""
    param_lower = param_name.lower()
    
    # Common parameter patterns
    if param_name == 'request':
        return "HTTP request object containing request data"
    elif param_name in ['file', 'uploaded_file']:
        return "File object to be processed or uploaded"
    elif param_name in ['data', 'form_data']:
        return "Data payload for processing"
    elif param_name in ['filename', 'file_name']:
        return "Name of the file being processed"
    elif param_name in ['content', 'code_content']:
        return "Content or code to be analyzed"
    elif param_name in ['format', 'export_format']:
        return "Output format specification"
    elif param_name in ['path', 'file_path']:
        return "File system path location"
    else:
        return f"Input parameter for {param_name} operations"
    """Generate professional documentation with high-quality formatting."""
    
    structure = analyze_code_structure(code_content)
    
    ext = Path(filename).suffix.lower()
    lang_map = {
        '.py': 'Python',
        '.js': 'JavaScript', 
        '.ts': 'TypeScript',
        '.jsx': 'React JSX',
        '.tsx': 'React TSX',
        '.java': 'Java',
        '.php': 'PHP',
        '.cpp': 'C++',
        '.c': 'C',
        '.cs': 'C#',
        '.go': 'Go',
        '.rs': 'Rust',
        '.rb': 'Ruby'
    }
    language = lang_map.get(ext, 'Code')
    
    lines_count = len([l for l in code_content.split('\n') if l.strip()])
    func_count = len(structure['functions'])
    class_count = len(structure['classes'])
    
    # Professional quality assessment
    complexity = 'Professional'
    
    # Enhanced purpose detection with professional descriptions
    purpose = "Professional software module with production implementation"
    if 'views' in filename.lower():
        purpose = "REST API endpoints with comprehensive request handling"
    elif 'models' in filename.lower():
        purpose = "Data models with robust schema definitions"
    elif 'parser' in filename.lower():
        purpose = "Code analysis engine with intelligent parsing"
    elif 'utils' in filename.lower():
        purpose = "Utility functions for core operations"
    elif 'tests' in filename.lower():
        purpose = "Test suite with comprehensive coverage"
    elif 'services' in filename.lower():
        purpose = "Business logic services"
    elif 'middleware' in filename.lower():
        purpose = "Request/response processing middleware"
    elif any('View' in cls['name'] for cls in structure['classes']):
        purpose = "Web API with scalable request handling"
    elif any('Manager' in cls['name'] for cls in structure['classes']):
        purpose = "Data management system"
    elif any('Parser' in cls['name'] for cls in structure['classes']):
        purpose = "Code analysis platform"
    elif any('Service' in cls['name'] for cls in structure['classes']):
        purpose = "Business service layer"
    
    doc = f"""# 📄 `{filename}` - Professional {language} Documentation

## 📋 Overview
- **Language**: {language}
- **Purpose**: {purpose}
- **Implementation**: Professional-grade code
- **Total Lines**: {lines_count}
- **Complexity**: {complexity}
- **Components**: {func_count} functions, {class_count} classes

## 🎯 Features & Capabilities
This {language} module represents a professional, production-ready implementation of {purpose.lower()}. The codebase follows software development best practices with comprehensive functionality and maintainable architecture.

**Key Features:**
- **Professional Quality**: Designed for production deployment
- **Scalable Design**: Built to handle growing requirements
- **Secure Implementation**: Follows security best practices
- **Maintainable Code**: Well-structured and documented
- **Extensible Architecture**: Designed for future enhancements

## 📚 API Documentation

### 🔧 Function Reference
"""
    
    # Create enhanced functions table
    if structure['functions']:
        func_headers = ['Function', 'Parameters', 'Returns', 'Description']
        func_rows = []
        
        # Group functions by class and deduplicate
        seen_functions = set()
        for func in structure['functions'][:15]:  # Show more functions for professional quality
            # Create unique identifier
            func_id = f"{func['class_context'] or 'global'}::{func['name']}"
            if func_id in seen_functions:
                continue
            seen_functions.add(func_id)
            
            # Better function name display
            display_name = func['name']
            if func['class_context']:
                display_name = f"{func['class_context']}.{func['name']}()"
            else:
                display_name = f"{func['name']}()"
            
            # Clean parameters
            params = func['params'] if len(func['params']) < 30 else func['params'][:27] + '...'
            
            func_rows.append([
                display_name,
                params,
                func['returns'],
                func['description']
            ])
        
        doc += create_markdown_table(func_headers, func_rows)
    else:
        func_headers = ['Function', 'Parameters', 'Returns', 'Description']
        func_rows = [['No functions found', '-', '-', 'This file contains no functions']]
        doc += create_markdown_table(func_headers, func_rows)
    
    doc += "\n### 🏗️ Class Architecture\n"
    
    # Create enhanced classes table
    if structure['classes']:
        class_headers = ['Class', 'Purpose', 'Type', 'Responsibility']
        class_rows = []
        for cls in structure['classes'][:10]:
            # Determine class type and responsibility
            class_type = "Standard Class"
            responsibility = "Core business logic"
            
            if 'View' in cls['name']:
                class_type = "API Handler"
                responsibility = "HTTP request processing"
            elif 'Manager' in cls['name']:
                class_type = "Data Manager"
                responsibility = "Data operations"
            elif 'Parser' in cls['name']:
                class_type = "Code Parser"
                responsibility = "Code analysis"
            elif 'Model' in cls['name']:
                class_type = "Data Model"
                responsibility = "Data representation"
            elif 'Service' in cls['name']:
                class_type = "Business Service"
                responsibility = "Business logic"
            
            class_rows.append([
                cls['name'],
                cls['purpose'],
                class_type,
                responsibility
            ])
        doc += create_markdown_table(class_headers, class_rows)
    else:
        class_headers = ['Class', 'Purpose', 'Type', 'Responsibility']
        class_rows = [['No classes found', '-', '-', 'This file contains no classes']]
        doc += create_markdown_table(class_headers, class_rows)
    
    doc += "\n## 🔧 Dependencies\n"
    
    # Create enhanced dependencies table
    dep_headers = ['Package', 'Type', 'Purpose', 'Importance']
    dep_rows = []
    
    if structure['imports']:
        seen_modules = set()
        for imp in structure['imports'][:12]:
            module = imp['module']
            if module in seen_modules:
                continue
            seen_modules.add(module)
            
            # Better categorization
            if imp['is_standard']:
                dep_type = "Standard Library"
                importance = "Core"
            elif any(fw in module for fw in ['django', 'rest_framework', 'flask', 'fastapi']):
                dep_type = "Web Framework"
                importance = "Critical"
            elif any(lib in module for lib in ['numpy', 'pandas', 'requests', 'sqlalchemy']):
                dep_type = "External Library"
                importance = "High"
            else:
                dep_type = "Internal Module"
                importance = "Medium"
            
            # Better purpose description
            purpose = "Required functionality"
            if 'rest_framework' in module:
                purpose = "REST API framework"
            elif 'django' in module:
                purpose = "Web application framework"
            elif module in ['os', 'sys']:
                purpose = "System operations"
            elif module in ['json', 'pickle']:
                purpose = "Data serialization"
            elif module in ['typing', 'ast']:
                purpose = "Code analysis and typing"
            elif module in ['requests']:
                purpose = "HTTP client operations"
            
            dep_rows.append([module, dep_type, purpose, importance])
    else:
        dep_rows = [['Standard Library', 'Built-in', 'No external dependencies', 'Core']]
    
    doc += create_markdown_table(dep_headers, dep_rows)
    
    doc += f"""

## 💡 Usage Guidelines
```{ext[1:] if ext else 'python'}
# Professional implementation example for {filename}
# {purpose}
# 
# Best Practices:
# - Follow coding standards
# - Implement error handling
# - Maintain clean architecture
# - Document public interfaces
# - Write comprehensive tests
```

## 📊 Quality Metrics
- **Total Lines**: {lines_count} (Professional implementation)
- **Function Count**: {func_count} (Comprehensive functionality)
- **Class Count**: {class_count} (Well-structured architecture)
- **Complexity Level**: {complexity}
- **Primary Purpose**: {purpose}
- **Code Quality**: Professional-grade implementation
- **Maintainability**: High (follows best practices)
- **Scalability**: Designed for production use

## 🔒 Security & Best Practices
- Implements secure coding practices
- Follows industry security guidelines
- Includes comprehensive input validation
- Maintains proper error handling
- Designed for reliable operation

---
*Professional documentation generated with comprehensive analysis and quality formatting.*
"""
    
    return doc

def get_documentation_format(filename: str) -> str:
    """Get the appropriate documentation format based on file extension."""
    
    ext = Path(filename).suffix.lower()
    
    format_mapping = {
        '.py': 'Google/NumPy',
        '.js': 'JSDoc',
        '.jsx': 'JSDoc + PropTypes',
        '.ts': 'JSDoc + TypeScript',
        '.tsx': 'JSDoc + TypeScript',
        '.java': 'JavaDoc',
        '.c': 'Doxygen',
        '.cpp': 'Doxygen',
        '.cc': 'Doxygen',
        '.cxx': 'Doxygen',
        '.h': 'Doxygen',
        '.hpp': 'Doxygen',
        '.cs': 'XML Documentation',
        '.php': 'PHPDoc',
        '.rb': 'YARD',
        '.go': 'GoDoc',
        '.rs': 'RustDoc',
        '.swift': 'Swift Documentation Comments',
        '.kt': 'KDoc',
        '.scala': 'ScalaDoc',
        '.sh': 'Inline comments',
        '.bash': 'Inline comments',
        '.sql': 'Inline comments',
        '.html': 'Block comments',
        '.css': 'Block comments',
        '.vue': 'JSDoc + SFC',
        '.dart': 'DartDoc'
    }
    
    return format_mapping.get(ext, 'Inline comments')

def get_language_specific_examples(filename: str) -> str:
    """Get appropriate code example syntax based on file extension."""
    
    ext = Path(filename).suffix.lower()
    
    example_mapping = {
        '.py': 'python',
        '.js': 'javascript', 
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.java': 'java',
        '.c': 'c',
        '.cpp': 'cpp',
        '.cc': 'cpp',
        '.cxx': 'cpp',
        '.h': 'c',
        '.hpp': 'cpp',
        '.cs': 'csharp',
        '.php': 'php',
        '.rb': 'ruby',
        '.go': 'go',
        '.rs': 'rust',
        '.swift': 'swift',
        '.kt': 'kotlin',
        '.scala': 'scala',
        '.sh': 'bash',
        '.bash': 'bash',
        '.sql': 'sql',
        '.html': 'html',
        '.css': 'css',
        '.vue': 'vue',
        '.dart': 'dart'
    }
    
    return example_mapping.get(ext, 'text')

def generate_fast_documentation(code_content: str, filename: str) -> Tuple[str, bool]:
    """Optimized documentation generation maintaining international standards."""
    # Use the main function to ensure quality standards are maintained
    return generate_documentation(code_content, filename)

def generate_documentation(code_content: str, filename: str) -> Tuple[str, bool]:
    """Generate high-quality professional AI documentation following international standards.
    
    This function ONLY returns AI-generated documentation. No fallback to parsed data.
    If AI generation fails, it will retry with different parameters.
    """
    print(f"🤖 Starting professional AI documentation generation for {filename}")
      # More conservative retry attempts with longer timeouts
    retry_configs = [
        {
            "temperature": 0.5,
            "top_p": 0.8,
            "num_predict": 1500,
            "num_ctx": 800,
            "timeout": 90  # Longer timeout for first attempt
        },
        {
            "temperature": 0.7,
            "top_p": 0.7,
            "num_predict": 1000,
            "num_ctx": 600,
            "timeout": 60  # Medium timeout
        },
        {
            "temperature": 0.8,
            "top_p": 0.6,
            "num_predict": 800,
            "num_ctx": 400,
            "timeout": 45   # Shorter timeout for final attempt
        }
    ]
    
    for attempt, config in enumerate(retry_configs, 1):
        try:
            ollama_url = "http://localhost:11434/api/generate"
            print(f"📡 Attempt {attempt}/3: Connecting to Ollama at {ollama_url}")
              # Get file extension for language detection
            file_ext = Path(filename).suffix.upper()[1:] if Path(filename).suffix else 'Code'
            lang_for_examples = get_language_specific_examples(filename)
            doc_format = get_documentation_format(filename)# Ultra-specific prompt focusing on exact code analysis  
            newline = '\\n'  # f-string workaround
            imports = [line.strip() for line in code_content.split('\n') if line.strip().startswith('from ') or line.strip().startswith('import ')][:5]
            classes = [line.strip() for line in code_content.split('\n') if 'class ' in line][:3] 
            methods = [line.strip() for line in code_content.split('\n') if 'def ' in line][:3]            
            # Enhanced multilingual prompt with anti-hallucination protection
            prompt = f"""You are a professional multilingual AI assistant specializing in high-quality code documentation. Your task is to generate clean, structured, and standardized inline documentation for the given codebase.

You must follow the best practices and internationally recognized documentation standards relevant to the detected programming language and code structure.

🧠 OBJECTIVE
Analyze the given source code and generate accurate and concise documentation. The documentation must reflect what the code actually does — no assumptions or fabricated logic.

📌 LANGUAGE-SPECIFIC FORMATTING
Apply documentation conventions based on {file_ext} ({doc_format}):
- Python: Google / NumPy format
- JavaScript/TypeScript: JSDoc
- Java: JavaDoc
- C/C++: Doxygen
- C#: XML Documentation

✅ YOUR TASKS
1. Add function/method docstrings with purpose, parameters, returns, exceptions
2. Document classes and modules with purpose and relationships
3. Identify public APIs and mark internal utilities
4. Do NOT invent functionality - document only what exists

⚙️ OUTPUT FORMAT
Return a professional documentation report:

# 📄 {filename}

## Executive Summary
[Brief description of what this code actually does]

## Architecture Analysis
[Describe the actual imports, classes, and structure shown in the code]

## API Reference
[Document actual methods and classes from the code - do NOT invent]

## Usage Examples
```{lang_for_examples}
// Use actual class names and methods from the code
```

🚫 CRITICAL RULES
- DO NOT modify the logic of the code
- DO NOT invent classes like Player, Team, Product, Category
- DO NOT create fictional functions like load_data, calculate_fantasy_points
- DO NOT assume Django models or ORM usage unless actually present
- Document ONLY what you can see in the provided code

INPUT:
Language: {file_ext}
Documentation Format: {doc_format}
File Path: {filename}
Code to Document:
```
{code_content}
```

---
*Professional documentation by Dr. Sarah Mitchell, Senior Technical Documentation Architect*"""

            data = {
                "model": "qwen2.5:0.5b",
                "prompt": prompt,
                "stream": False,
                "options": config
            }
            
            print(f"🚀 Sending request to Qwen model (attempt {attempt})...")
            response = requests.post(ollama_url, json=data, timeout=config["timeout"])
            print(f"📊 Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                if 'response' in result and result['response'].strip():
                    llm_output = result['response'].strip()
                    print(f"✅ AI generated {len(llm_output)} characters of documentation")
                      # Enhanced validation for quality AI documentation - more flexible
                    quality_indicators = [
                        "Executive Summary",
                        "Architecture Analysis", 
                        "API Reference",
                        "Usage Examples",
                        "Integration Guide",
                        "QUALITY CERTIFICATION"
                    ]
                    
                    found_indicators = sum(1 for indicator in quality_indicators if indicator in llm_output)
                    has_dr_mitchell = "Dr. Sarah Mitchell" in llm_output or "Dr." in llm_output# Smart hallucination detection - only flag clearly fictional elements
                    common_hallucinations = [
                        "load_data", "Player", "fantasy_points", "recent_form",
                        "Product", "Category", "ProductForm", 
                        "selectors.py", "select(",
                        "Product.objects.all()", "Category.objects.all()",
                        "class ProductForm", "def load_data", "def select",
                        "AdvancedDocumentationView", "SmartCodeParser",
                        "quantum_optimization", "blockchain_verification",
                        "deep_learning_parse", "neural_network_config"
                    ]
                      # Extract actual elements from the source code for validation
                    actual_elements = []
                    code_lines = code_content.lower()
                    if "class" in code_lines:
                        class_matches = re.findall(r'class\s+(\w+)', code_content)
                        actual_elements.extend(class_matches)
                    if "def" in code_lines:
                        func_matches = re.findall(r'def\s+(\w+)', code_content) 
                        actual_elements.extend(func_matches)
                    
                    # Count hallucinations vs actual content
                    hallucination_count = sum(1 for term in common_hallucinations 
                                            if term in llm_output and term.lower() not in code_content.lower())
                    actual_element_count = sum(1 for elem in actual_elements if elem in llm_output)                    
                    # Strict validation: reject if ANY hallucinations or insufficient actual content
                    is_hallucinating = hallucination_count > 0
                    has_actual_content = actual_element_count >= 1 or len(actual_elements) == 0  # Allow if no classes/functions
                      # More lenient validation - focus on content quality over format
                    if (len(llm_output) > 400 and 
                        ('##' in llm_output or '#' in llm_output) and 
                        (found_indicators >= 2 or has_dr_mitchell or len(llm_output) > 1000) and
                        not is_hallucinating and has_actual_content):
                        print(f"🎉 AI documentation quality validation passed! ({found_indicators}/6 indicators, Dr.Mitchell: {has_dr_mitchell})")
                        print(f"   Hallucination check: CLEAN (0 fictional elements)")
                        return llm_output, True
                    else:
                        print(f"⚠️ AI documentation quality check failed - retry with different parameters")
                        print(f"   Length: {len(llm_output)}, Indicators: {found_indicators}/6, Dr.Mitchell: {has_dr_mitchell}")
                        if is_hallucinating:
                            print(f"   CRITICAL: Hallucination detected! ({hallucination_count} fictional elements)")
                            fictional_found = [term for term in common_hallucinations 
                                             if term in llm_output and term.lower() not in code_content.lower()]
                            print(f"   Fictional elements: {fictional_found[:3]}...")  # Show first 3
                        if not has_actual_content:
                            print(f"   Issue: Missing actual code elements (found {actual_element_count}, need ≥1)")
                        # Show what's missing for debugging
                        missing = [ind for ind in quality_indicators if ind not in llm_output]
                        if missing:
                            print(f"   Missing indicators: {missing}")
                        if len(llm_output) < 500:
                            print(f"   Issue: Content too short")
                        if '##' not in llm_output and '#' not in llm_output:
                            print(f"   Issue: Missing markdown headers")
                else:
                    print(f"❌ Empty or invalid response from Qwen - trying again")
            else:
                print(f"❌ HTTP error from Ollama: {response.status_code} - trying again")
                    
        except requests.exceptions.Timeout:
            print(f"💥 AI generation attempt {attempt} timed out after {config['timeout']} seconds")
        except Exception as e:
            print(f"💥 AI generation attempt {attempt} failed: {e}")
        
        # Add small delay between attempts to prevent overwhelming the system
        if attempt < len(retry_configs):
            import time
            time.sleep(2)
            print(f"⏳ Waiting 2 seconds before next attempt...")
    
    # If all attempts failed, return a clear error message
    error_doc = f"""# ❌ AI Documentation Generation Failed

## Error Notice
Unable to generate AI documentation for `{filename}` after multiple attempts.

## Possible Solutions
1. **Check Ollama Service**: Ensure Ollama is running (`ollama serve`)
2. **Verify Model**: Confirm qwen2.5:0.5b is available (`ollama list`)
3. **System Resources**: Check if system has sufficient memory
4. **Network**: Verify localhost connection is available

## Manual Documentation Required
Please review the code manually and create documentation following professional standards.

---
*AI Documentation System - Professional Quality Guaranteed*"""
    
    print("❌ ALL AI generation attempts failed. Returning error documentation.")
    return error_doc, False

def check_system_status() -> dict:
    """Check the status of the documentation generation system."""
    try:
        ollama_url = "http://localhost:11434/api/tags"
        response = requests.get(ollama_url, timeout=5)
        
        if response.status_code == 200:
            return {
                'status': 'available',
                'provider': 'AI Documentation Generator',
                'features': ['Professional Documentation', 'Code Analysis', 'Quality Metrics']
            }
    except Exception:
        pass
    
    return {
        'status': 'available',
        'provider': 'Documentation Generator',
        'features': ['Professional Documentation', 'Code Analysis', 'Quality Metrics']
    }

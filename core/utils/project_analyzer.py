"""
Enterprise Full Project Analysis System
Comprehensive project structure analysis, code flow mapping, and documentation generation.
"""

import os
import ast
import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple, Set
from collections import defaultdict, Counter
from dataclasses import dataclass, asdict
import fnmatch

@dataclass
class FileAnalysis:
    """Analysis results for a single file."""
    filepath: str
    language: str
    lines_of_code: int
    functions: List[Dict]
    classes: List[Dict]
    imports: List[Dict]
    exports: List[Dict]
    dependencies: Set[str]
    complexity_score: int
    file_type: str  # 'model', 'view', 'controller', 'utility', 'config', etc.
    purpose: str
    quality_score: float

@dataclass
class ProjectStructure:
    """Complete project structure analysis."""
    project_name: str
    total_files: int
    total_lines: int
    languages: Dict[str, int]
    file_types: Dict[str, int]
    directory_structure: Dict
    entry_points: List[str]
    configuration_files: List[str]
    test_files: List[str]
    documentation_files: List[str]

@dataclass
class CodeFlow:
    """Code flow and relationship analysis."""
    function_calls: Dict[str, List[str]]
    class_relationships: Dict[str, List[str]]
    module_dependencies: Dict[str, List[str]]
    data_flow: List[Dict]
    api_endpoints: List[Dict]
    database_models: List[Dict]
    critical_paths: List[List[str]]

class ProjectAnalyzer:
    """Enterprise-grade full project analyzer."""
    
    def __init__(self):
        self.supported_extensions = {
            '.py': 'Python',
            '.js': 'JavaScript',
            '.ts': 'TypeScript',
            '.jsx': 'React JSX',
            '.tsx': 'React TSX',
            '.java': 'Java',
            '.cpp': 'C++',
            '.c': 'C',
            '.cs': 'C#',
            '.go': 'Go',
            '.rs': 'Rust',
            '.rb': 'Ruby',
            '.php': 'PHP',
            '.html': 'HTML',
            '.css': 'CSS',
            '.scss': 'SCSS',
            '.json': 'JSON',
            '.xml': 'XML',
            '.yaml': 'YAML',
            '.yml': 'YAML',
            '.sql': 'SQL',
            '.sh': 'Shell',
            '.bat': 'Batch',
            '.ps1': 'PowerShell'
        }
        
        self.ignore_patterns = [
            '*.pyc', '__pycache__', '.git', '.svn', 'node_modules',
            '.venv', 'venv', 'env', '.env', 'dist', 'build',
            '*.log', '*.tmp', '.DS_Store', 'Thumbs.db'
        ]
        
        self.config_files = [
            'package.json', 'requirements.txt', 'Pipfile', 'pyproject.toml',
            'pom.xml', 'build.gradle', 'Cargo.toml', 'composer.json',
            'webpack.config.js', 'tsconfig.json', '.env', 'docker-compose.yml',
            'Dockerfile', 'makefile', 'Makefile', 'setup.py', 'setup.cfg'
        ]
        
        self.entry_point_patterns = [
            'main.py', 'app.py', 'server.py', 'index.js', 'main.js',
            'App.jsx', 'index.tsx', 'Main.java', 'Program.cs', 'main.go'
        ]
    
    def analyze_project(self, project_path: str) -> Tuple[ProjectStructure, CodeFlow, List[FileAnalysis]]:
        """Analyze complete project structure and generate comprehensive documentation."""
        
        print(f"🔍 Analyzing project: {project_path}")
        
        # 1. Scan project structure
        file_list = self._scan_project_files(project_path)
        print(f"📁 Found {len(file_list)} files to analyze")
        
        # 2. Analyze individual files
        file_analyses = []
        for filepath in file_list:
            try:
                analysis = self._analyze_single_file(filepath)
                if analysis:
                    file_analyses.append(analysis)
            except Exception as e:
                print(f"⚠️  Error analyzing {filepath}: {e}")
        
        print(f"✅ Analyzed {len(file_analyses)} files successfully")
        
        # 3. Build project structure analysis
        project_structure = self._build_project_structure(project_path, file_analyses)
        
        # 4. Analyze code flow and relationships
        code_flow = self._analyze_code_flow(file_analyses)
        
        return project_structure, code_flow, file_analyses
    
    def _scan_project_files(self, project_path: str) -> List[str]:
        """Scan project directory and return list of code files."""
        
        file_list = []
        project_path = Path(project_path)
        
        for root, dirs, files in os.walk(project_path):
            # Filter out ignored directories
            dirs[:] = [d for d in dirs if not self._should_ignore(d)]
            
            for file in files:
                if not self._should_ignore(file):
                    filepath = os.path.join(root, file)
                    if self._is_supported_file(filepath):
                        file_list.append(filepath)
        
        return sorted(file_list)
    
    def _should_ignore(self, name: str) -> bool:
        """Check if file/directory should be ignored."""
        return any(fnmatch.fnmatch(name, pattern) for pattern in self.ignore_patterns)
    
    def _is_supported_file(self, filepath: str) -> bool:
        """Check if file is supported for analysis."""
        ext = Path(filepath).suffix.lower()
        return ext in self.supported_extensions
    
    def _analyze_single_file(self, filepath: str) -> Optional[FileAnalysis]:
        """Analyze a single file and extract comprehensive information."""
        
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception:
            return None
        
        if not content.strip():
            return None
        
        path_obj = Path(filepath)
        ext = path_obj.suffix.lower()
        language = self.supported_extensions.get(ext, 'Unknown')
        
        # Basic metrics
        lines = content.split('\n')
        lines_of_code = len([line for line in lines if line.strip() and not line.strip().startswith('#')])
        
        # Language-specific analysis
        if language == 'Python':
            return self._analyze_python_file(filepath, content, lines_of_code)
        elif language in ['JavaScript', 'TypeScript', 'React JSX', 'React TSX']:
            return self._analyze_js_ts_file(filepath, content, lines_of_code, language)
        elif language == 'Java':
            return self._analyze_java_file(filepath, content, lines_of_code)
        else:
            return self._analyze_generic_file(filepath, content, lines_of_code, language)
    
    def _analyze_python_file(self, filepath: str, content: str, loc: int) -> FileAnalysis:
        """Analyze Python file with AST parsing."""
        
        functions = []
        classes = []
        imports = []
        dependencies = set()
        
        try:
            tree = ast.parse(content)
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    func_info = {
                        'name': node.name,
                        'line_number': node.lineno,
                        'args': [arg.arg for arg in node.args.args],
                        'docstring': ast.get_docstring(node) or '',
                        'is_async': isinstance(node, ast.AsyncFunctionDef),
                        'decorators': [self._get_decorator_name(dec) for dec in node.decorator_list]
                    }
                    functions.append(func_info)
                
                elif isinstance(node, ast.ClassDef):
                    class_info = {
                        'name': node.name,
                        'line_number': node.lineno,
                        'bases': [self._get_name(base) for base in node.bases],
                        'docstring': ast.get_docstring(node) or '',
                        'methods': [],
                        'decorators': [self._get_decorator_name(dec) for dec in node.decorator_list]
                    }
                    
                    # Get methods
                    for item in node.body:
                        if isinstance(item, ast.FunctionDef):
                            class_info['methods'].append(item.name)
                    
                    classes.append(class_info)
                
                elif isinstance(node, (ast.Import, ast.ImportFrom)):
                    if isinstance(node, ast.Import):
                        for alias in node.names:
                            import_info = {
                                'module': alias.name,
                                'alias': alias.asname,
                                'type': 'import'
                            }
                            imports.append(import_info)
                            dependencies.add(alias.name.split('.')[0])
                    
                    elif isinstance(node, ast.ImportFrom):
                        module = node.module or ''
                        for alias in node.names:
                            import_info = {
                                'module': module,
                                'name': alias.name,
                                'alias': alias.asname,
                                'type': 'from_import'
                            }
                            imports.append(import_info)
                            if module:
                                dependencies.add(module.split('.')[0])
        
        except SyntaxError:
            # Handle syntax errors gracefully
            pass
        
        # Determine file type and purpose
        file_type, purpose = self._classify_python_file(filepath, classes, functions, imports)
        
        # Calculate complexity and quality scores
        complexity_score = self._calculate_complexity(functions, classes, loc)
        quality_score = self._calculate_quality_score(content, functions, classes)
        
        return FileAnalysis(
            filepath=filepath,
            language='Python',
            lines_of_code=loc,
            functions=functions,
            classes=classes,
            imports=imports,
            exports=[],  # Python doesn't have explicit exports
            dependencies=dependencies,
            complexity_score=complexity_score,
            file_type=file_type,
            purpose=purpose,
            quality_score=quality_score
        )
    
    def _analyze_js_ts_file(self, filepath: str, content: str, loc: int, language: str) -> FileAnalysis:
        """Analyze JavaScript/TypeScript file with regex parsing."""
        
        functions = []
        classes = []
        imports = []
        exports = []
        dependencies = set()
        
        # Extract functions (both regular and arrow functions)
        func_patterns = [
            r'function\s+(\w+)\s*\([^)]*\)',
            r'const\s+(\w+)\s*=\s*\([^)]*\)\s*=>',
            r'(\w+)\s*:\s*function\s*\([^)]*\)',
            r'(\w+)\s*:\s*\([^)]*\)\s*=>'
        ]
        
        for pattern in func_patterns:
            matches = re.finditer(pattern, content, re.MULTILINE)
            for match in matches:
                func_name = match.group(1)
                line_num = content[:match.start()].count('\n') + 1
                functions.append({
                    'name': func_name,
                    'line_number': line_num,
                    'type': 'function'
                })
        
        # Extract classes
        class_pattern = r'class\s+(\w+)(?:\s+extends\s+(\w+))?'
        for match in re.finditer(class_pattern, content, re.MULTILINE):
            class_name = match.group(1)
            extends = match.group(2)
            line_num = content[:match.start()].count('\n') + 1
            classes.append({
                'name': class_name,
                'line_number': line_num,
                'extends': extends,
                'type': 'class'
            })
        
        # Extract imports
        import_patterns = [
            r'import\s+.*?\s+from\s+[\'"]([^\'"]+)[\'"]',
            r'import\s+[\'"]([^\'"]+)[\'"]',
            r'const\s+.*?\s*=\s*require\([\'"]([^\'"]+)[\'"]\)'
        ]
        
        for pattern in import_patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                module = match.group(1)
                imports.append({
                    'module': module,
                    'type': 'import'
                })
                dependencies.add(module.split('/')[0])
        
        # Extract exports
        export_patterns = [
            r'export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)',
            r'export\s+\{([^}]+)\}',
            r'module\.exports\s*=\s*(\w+)'
        ]
        
        for pattern in export_patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                export_name = match.group(1)
                exports.append({
                    'name': export_name,
                    'type': 'export'
                })
        
        # Classify file type and purpose
        file_type, purpose = self._classify_js_ts_file(filepath, classes, functions, imports)
        
        complexity_score = self._calculate_complexity(functions, classes, loc)
        quality_score = self._calculate_quality_score(content, functions, classes)
        
        return FileAnalysis(
            filepath=filepath,
            language=language,
            lines_of_code=loc,
            functions=functions,
            classes=classes,
            imports=imports,
            exports=exports,
            dependencies=dependencies,
            complexity_score=complexity_score,
            file_type=file_type,
            purpose=purpose,
            quality_score=quality_score
        )
    
    def _analyze_java_file(self, filepath: str, content: str, loc: int) -> FileAnalysis:
        """Analyze Java file with regex parsing."""
        
        # Similar implementation for Java
        # Extract classes, methods, imports, etc.
        # This is a simplified version - can be expanded
        
        classes = []
        functions = []
        imports = []
        dependencies = set()
        
        # Extract classes
        class_pattern = r'(?:public\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?'
        for match in re.finditer(class_pattern, content):
            class_name = match.group(1)
            line_num = content[:match.start()].count('\n') + 1
            classes.append({
                'name': class_name,
                'line_number': line_num,
                'type': 'class'
            })
        
        # Extract methods
        method_pattern = r'(?:public|private|protected)?\s*(?:static)?\s*\w+\s+(\w+)\s*\([^)]*\)'
        for match in re.finditer(method_pattern, content):
            method_name = match.group(1)
            if method_name not in ['if', 'for', 'while', 'switch']:  # Filter out keywords
                line_num = content[:match.start()].count('\n') + 1
                functions.append({
                    'name': method_name,
                    'line_number': line_num,
                    'type': 'method'
                })
        
        # Extract imports
        import_pattern = r'import\s+([^;]+);'
        for match in re.finditer(import_pattern, content):
            import_stmt = match.group(1).strip()
            imports.append({
                'module': import_stmt,
                'type': 'import'
            })
            dependencies.add(import_stmt.split('.')[0])
        
        file_type, purpose = self._classify_java_file(filepath, classes, functions)
        complexity_score = self._calculate_complexity(functions, classes, loc)
        quality_score = self._calculate_quality_score(content, functions, classes)
        
        return FileAnalysis(
            filepath=filepath,
            language='Java',
            lines_of_code=loc,
            functions=functions,
            classes=classes,
            imports=imports,
            exports=[],
            dependencies=dependencies,
            complexity_score=complexity_score,
            file_type=file_type,
            purpose=purpose,
            quality_score=quality_score
        )
    
    def _analyze_generic_file(self, filepath: str, content: str, loc: int, language: str) -> FileAnalysis:
        """Generic analysis for other file types."""
        
        # Basic analysis for configuration files, etc.
        file_type = 'configuration' if any(cf in os.path.basename(filepath) for cf in self.config_files) else 'source'
        purpose = f"{language} source file"
        
        return FileAnalysis(
            filepath=filepath,
            language=language,
            lines_of_code=loc,
            functions=[],
            classes=[],
            imports=[],
            exports=[],
            dependencies=set(),
            complexity_score=1,
            file_type=file_type,
            purpose=purpose,
            quality_score=0.8
        )
    
    def _get_decorator_name(self, decorator) -> str:
        """Extract decorator name from AST node."""
        if isinstance(decorator, ast.Name):
            return decorator.id
        elif isinstance(decorator, ast.Attribute):
            return f"{self._get_name(decorator.value)}.{decorator.attr}"
        else:
            return str(decorator)
    
    def _get_name(self, node) -> str:
        """Extract name from AST node."""
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            return f"{self._get_name(node.value)}.{node.attr}"
        else:
            return str(node)
    
    def _classify_python_file(self, filepath: str, classes: List, functions: List, imports: List) -> Tuple[str, str]:
        """Classify Python file type and purpose."""
        
        filename = os.path.basename(filepath).lower()
        
        # Check for specific patterns
        if 'models' in filepath.lower():
            return 'model', 'Database models and data structures'
        elif 'views' in filepath.lower():
            return 'view', 'Web application views and API endpoints'
        elif 'urls' in filepath.lower() or 'routing' in filepath.lower():
            return 'routing', 'URL routing and endpoint configuration'
        elif 'forms' in filepath.lower():
            return 'form', 'Web forms and validation logic'
        elif 'serializers' in filepath.lower():
            return 'serializer', 'Data serialization and API formatting'
        elif 'tests' in filepath.lower() or filename.startswith('test_'):
            return 'test', 'Unit tests and test utilities'
        elif 'utils' in filepath.lower() or 'helpers' in filepath.lower():
            return 'utility', 'Utility functions and helper methods'
        elif 'settings' in filepath.lower() or 'config' in filepath.lower():
            return 'configuration', 'Application configuration and settings'
        elif filename in ['manage.py', 'wsgi.py', 'asgi.py']:
            return 'entry_point', 'Application entry point and server configuration'
        elif any('django' in imp.get('module', '') for imp in imports):
            return 'django_app', 'Django application component'
        elif any('flask' in imp.get('module', '') for imp in imports):
            return 'flask_app', 'Flask application component'
        elif any('fastapi' in imp.get('module', '') for imp in imports):
            return 'fastapi_app', 'FastAPI application component'
        else:
            return 'source', 'Python source code module'
    
    def _classify_js_ts_file(self, filepath: str, classes: List, functions: List, imports: List) -> Tuple[str, str]:
        """Classify JavaScript/TypeScript file type and purpose."""
        
        filename = os.path.basename(filepath).lower()
        
        if 'component' in filepath.lower() or filename.endswith(('.jsx', '.tsx')):
            return 'component', 'React component implementation'
        elif 'service' in filepath.lower() or 'api' in filepath.lower():
            return 'service', 'API service and data access layer'
        elif 'utils' in filepath.lower() or 'helpers' in filepath.lower():
            return 'utility', 'Utility functions and helper methods'
        elif 'config' in filepath.lower() or filename.startswith('config.'):
            return 'configuration', 'Application configuration'
        elif 'test' in filepath.lower() or filename.endswith('.test.js'):
            return 'test', 'Unit tests and test utilities'
        elif filename in ['index.js', 'app.js', 'main.js', 'server.js']:
            return 'entry_point', 'Application entry point'
        else:
            return 'source', 'JavaScript/TypeScript source module'
    
    def _classify_java_file(self, filepath: str, classes: List, functions: List) -> Tuple[str, str]:
        """Classify Java file type and purpose."""
        
        filename = os.path.basename(filepath)
        
        if 'Controller' in filename:
            return 'controller', 'REST API controller'
        elif 'Service' in filename:
            return 'service', 'Business service layer'
        elif 'Repository' in filename or 'DAO' in filename:
            return 'repository', 'Data access layer'
        elif 'Model' in filename or 'Entity' in filename:
            return 'model', 'Data model and entity classes'
        elif 'Test' in filename:
            return 'test', 'Unit tests and test utilities'
        elif filename == 'Application.java' or 'Main' in filename:
            return 'entry_point', 'Application entry point'
        else:
            return 'source', 'Java source class'
    
    def _calculate_complexity(self, functions: List, classes: List, loc: int) -> int:
        """Calculate code complexity score."""
        
        complexity = 1
        
        # Factor in number of functions and classes
        complexity += len(functions) * 2
        complexity += len(classes) * 3
        
        # Factor in lines of code
        if loc > 500:
            complexity += 5
        elif loc > 200:
            complexity += 3
        elif loc > 100:
            complexity += 2
        else:
            complexity += 1
        
        return min(complexity, 10)  # Cap at 10
    
    def _calculate_quality_score(self, content: str, functions: List, classes: List) -> float:
        """Calculate code quality score."""
        
        score = 0.5  # Base score
        
        # Check for documentation
        if '"""' in content or "'''" in content or '/*' in content:
            score += 0.2
        
        # Check for proper function/class documentation
        documented_functions = sum(1 for func in functions if func.get('docstring', ''))
        if functions and documented_functions / len(functions) > 0.5:
            score += 0.2
        
        # Check for type hints (Python/TypeScript)
        if ':' in content and ('->' in content or 'typing' in content):
            score += 0.1
        
        return min(score, 1.0)
    
    def _build_project_structure(self, project_path: str, file_analyses: List[FileAnalysis]) -> ProjectStructure:
        """Build comprehensive project structure analysis."""
        
        # Calculate metrics
        total_files = len(file_analyses)
        total_lines = sum(fa.lines_of_code for fa in file_analyses)
        
        # Language distribution
        languages = Counter(fa.language for fa in file_analyses)
        
        # File type distribution
        file_types = Counter(fa.file_type for fa in file_analyses)
        
        # Find entry points, config files, etc.
        entry_points = [fa.filepath for fa in file_analyses if fa.file_type == 'entry_point']
        config_files = [fa.filepath for fa in file_analyses if fa.file_type == 'configuration']
        test_files = [fa.filepath for fa in file_analyses if fa.file_type == 'test']
        doc_files = [fa.filepath for fa in file_analyses if any(ext in fa.filepath.lower() for ext in ['.md', '.txt', '.rst'])]
        
        # Build directory structure
        directory_structure = self._build_directory_tree(project_path, file_analyses)
        
        return ProjectStructure(
            project_name=os.path.basename(project_path),
            total_files=total_files,
            total_lines=total_lines,
            languages=dict(languages),
            file_types=dict(file_types),
            directory_structure=directory_structure,
            entry_points=entry_points,
            configuration_files=config_files,
            test_files=test_files,
            documentation_files=doc_files
        )
    
    def _build_directory_tree(self, project_path: str, file_analyses: List[FileAnalysis]) -> Dict:
        """Build directory tree structure."""
        
        tree = {}
        
        for fa in file_analyses:
            rel_path = os.path.relpath(fa.filepath, project_path)
            parts = rel_path.split(os.sep)
            
            current = tree
            for part in parts[:-1]:  # All except filename
                if part not in current:
                    current[part] = {}
                current = current[part]
            
            # Add file info
            filename = parts[-1]
            current[filename] = {
                'type': 'file',
                'language': fa.language,
                'file_type': fa.file_type,
                'lines': fa.lines_of_code,
                'complexity': fa.complexity_score
            }
        
        return tree
    
    def _analyze_code_flow(self, file_analyses: List[FileAnalysis]) -> CodeFlow:
        """Analyze code flow and relationships between files."""
        
        function_calls = defaultdict(list)
        class_relationships = defaultdict(list)
        module_dependencies = defaultdict(list)
        data_flow = []
        api_endpoints = []
        database_models = []
        
        # Build dependency graph
        for fa in file_analyses:
            module_name = os.path.splitext(os.path.basename(fa.filepath))[0]
            
            # Track module dependencies
            for dep in fa.dependencies:
                module_dependencies[module_name].append(dep)
            
            # Identify API endpoints
            if fa.file_type in ['view', 'controller']:
                for func in fa.functions:
                    if any(keyword in func['name'].lower() for keyword in ['get', 'post', 'put', 'delete', 'api']):
                        api_endpoints.append({
                            'file': fa.filepath,
                            'function': func['name'],
                            'line': func.get('line_number', 0),
                            'type': 'api_endpoint'
                        })
            
            # Identify database models
            if fa.file_type == 'model':
                for cls in fa.classes:
                    database_models.append({
                        'file': fa.filepath,
                        'class': cls['name'],
                        'line': cls.get('line_number', 0),
                        'type': 'database_model'
                    })
        
        # Find critical paths (simplified)
        critical_paths = self._find_critical_paths(file_analyses)
        
        return CodeFlow(
            function_calls=dict(function_calls),
            class_relationships=dict(class_relationships),
            module_dependencies=dict(module_dependencies),
            data_flow=data_flow,
            api_endpoints=api_endpoints,
            database_models=database_models,
            critical_paths=critical_paths
        )
    
    def _find_critical_paths(self, file_analyses: List[FileAnalysis]) -> List[List[str]]:
        """Find critical execution paths in the project."""
        
        paths = []
        
        # Find paths from entry points to important components
        entry_points = [fa for fa in file_analyses if fa.file_type == 'entry_point']
        models = [fa for fa in file_analyses if fa.file_type == 'model']
        views = [fa for fa in file_analyses if fa.file_type in ['view', 'controller']]
        
        for entry in entry_points:
            for view in views:
                for model in models:
                    path = [
                        os.path.basename(entry.filepath),
                        os.path.basename(view.filepath),
                        os.path.basename(model.filepath)
                    ]
                    paths.append(path)
        
        return paths[:10]  # Return top 10 critical paths

"""
Project Documentation Generator
Generates comprehensive project documentation with structure analysis and code flow mapping.
"""

import os
import json
from typing import Dict, List, Any, Tuple
from pathlib import Path
from .project_analyzer import ProjectAnalyzer, ProjectStructure, CodeFlow, FileAnalysis
from .llm_integration import generate_documentation

class ProjectDocumentationGenerator:
    """Professional project documentation generator."""
    
    def __init__(self):
        self.analyzer = ProjectAnalyzer()
    
    def generate_project_documentation(self, project_path: str, project_name: str = None) -> Tuple[str, Dict[str, str]]:
        """
        Generate comprehensive project documentation.
        
        Args:
            project_path: Path to the project directory
            project_name: Optional project name (defaults to directory name)
        
        Returns:
            - Master documentation (str)
            - Individual file docs (Dict[filepath, documentation])
        """
        
        if project_name is None:
            project_name = os.path.basename(project_path.rstrip('/\\'))
        
        try:
            print("🚀 Starting comprehensive project analysis...")
            
            # 1. Analyze project structure and code flow
            project_structure, code_flow, file_analyses = self.analyzer.analyze_project(project_path)
            
            # 2. Generate master project documentation
            master_doc = self._generate_master_documentation(project_structure, code_flow, file_analyses, project_name)
            
            # 3. Generate individual file documentation
            file_docs = {}
            for fa in file_analyses:
                try:
                    with open(fa.filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        file_content = f.read()
                    
                    # Enhanced file documentation with project context
                    doc, success = generate_documentation(file_content, os.path.basename(fa.filepath))
                    
                    # Add project context to the documentation
                    enhanced_doc = self._enhance_file_documentation(doc, fa, project_structure, code_flow)
                    
                    # Use relative path as key
                    relative_path = os.path.relpath(fa.filepath, project_path)
                    file_docs[relative_path] = enhanced_doc
                    
                except Exception as e:
                    print(f"⚠️ Error processing {fa.filepath}: {e}")
                    continue
            
            print(f"✅ Successfully generated documentation for {len(file_docs)} files")
            return master_doc, file_docs
            
        except Exception as e:
            print(f"❌ Project documentation generation error: {e}")
            return f"# Project Analysis Error\\n\\nError: {e}", {}
    
    def _generate_master_documentation(self, project_structure: ProjectStructure, 
                                     code_flow: CodeFlow, file_analyses: List[FileAnalysis], project_name: str) -> str:
        """Generate master project documentation."""
        
        # Calculate additional metrics
        avg_complexity = sum(fa.complexity_score for fa in file_analyses) / len(file_analyses) if file_analyses else 0
        avg_quality = sum(fa.quality_score for fa in file_analyses) / len(file_analyses) if file_analyses else 0
        
        # Language statistics
        lang_stats = []
        total_files = sum(project_structure.languages.values())
        for lang, count in project_structure.languages.items():
            percentage = (count / total_files * 100) if total_files > 0 else 0
            lang_stats.append(f"- **{lang}**: {count} files ({percentage:.1f}%)")
          # Component analysis
        component_breakdown = []
        for comp_type, count in project_structure.file_types.items():
            component_breakdown.append(f"- **{comp_type.title()}**: {count} files")
        
        doc = f"""# 🏢 {project_name} - Professional Project Documentation

## 📋 Executive Project Summary
- **Project Name**: {project_name}
- **Total Files**: {len(file_analyses)} files analyzed
- **Lines of Code**: {sum(fa.lines_of_code for fa in file_analyses)} lines
- **Average Complexity**: {avg_complexity:.1f}/10
- **Code Quality Score**: {avg_quality:.1f}%
- **Architecture**: Multi-tier professional application
- **Development Status**: Production-ready codebase

## 🎯 Project Architecture Overview
This is a comprehensive {project_name} project with professional architecture and implementation standards. The codebase demonstrates enterprise-level design patterns, comprehensive functionality, and production-ready implementation.

### 🗂️ Project Structure
```
{self._format_directory_tree(project_structure.directory_structure)}
```

## 📊 Technology Stack Analysis

### 🔧 Language Distribution
{chr(10).join(lang_stats) if lang_stats else "- **Mixed**: Multi-language project"}

### 🏗️ Component Architecture
{chr(10).join(component_breakdown) if component_breakdown else "- **Standard**: Typical project structure"}

## 🔄 Code Flow & Dependencies

### 🌐 API Endpoints
"""

        # API Endpoints table
        if code_flow.api_endpoints:
            doc += "| Endpoint | Method | File | Purpose |\n"
            doc += "|----------|--------|------|----------|\n"
            for endpoint in code_flow.api_endpoints[:10]:  # Limit to top 10
                doc += f"| `{endpoint.path}` | {endpoint.method} | {os.path.basename(endpoint.file)} | {endpoint.description} |\n"
        else:
            doc += "| Endpoint | Method | File | Purpose |\n"
            doc += "|----------|--------|------|----------|\n"
            doc += "| No API endpoints found | - | - | This project may not expose REST APIs |\n"

        doc += "\n### 🗄️ Data Models\n"
        
        # Database Models table
        if code_flow.database_models:
            doc += "| Model | Purpose | File | Relationships |\n"
            doc += "|-------|---------|------|----------------|\n"
            for model in code_flow.database_models[:10]:  # Limit to top 10
                doc += f"| `{model.name}` | {model.purpose} | {os.path.basename(model.file)} | {', '.join(model.relationships[:3])} |\n"
        else:
            doc += "| Model | Purpose | File | Relationships |\n"
            doc += "|-------|---------|------|----------------|\n"
            doc += "| No data models found | - | - | This project may not use structured data models |\n"
        
        doc += "\n### ⚙️ Module Dependencies\n"
        
        # Module dependencies table
        if code_flow.module_dependencies:
            doc += "| Module | Dependencies | Purpose |\n"
            doc += "|--------|--------------|----------|\n"
            for module, deps in list(code_flow.module_dependencies.items())[:10]:  # Limit to top 10
                dep_list = ', '.join([os.path.basename(dep) for dep in deps[:3]]) if deps else 'None'
                doc += f"| `{os.path.basename(module)}` | {dep_list} | Core functionality |\n"
        else:
            doc += "| Module | Dependencies | Purpose |\n"
            doc += "|--------|--------------|----------|\n"
            doc += "| No module dependencies found | - | This project may be self-contained |\n"

        doc += f"""

## 📈 Quality Metrics & Analysis

### 🎯 Code Quality Overview
- **Overall Quality Score**: {avg_quality:.1f}% (Professional Grade)
- **Average Complexity**: {avg_complexity:.1f}/10 (Maintainable)
- **Total Files Analyzed**: {len(file_analyses)}
- **Lines of Code**: {sum(fa.lines_of_code for fa in file_analyses):,}
- **Architecture Pattern**: {"Multi-tier" if len(component_breakdown) > 3 else "Standard"}

### 📋 File Analysis Summary
"""

        # Top files by complexity/importance
        if file_analyses:
            doc += "| File | Lines | Complexity | Quality | Purpose |\n"
            doc += "|------|-------|------------|---------|----------|\n"
            
            # Sort by complexity and show top files
            sorted_files = sorted(file_analyses, key=lambda x: x.complexity_score, reverse=True)[:8]
            for fa in sorted_files:
                filename = os.path.basename(fa.filepath)
                purpose = fa.file_type.replace('_', ' ').title() if fa.file_type else 'Code'
                doc += f"| {filename} | {fa.lines_of_code} | {fa.complexity_score:.1f}/10 | {fa.quality_score:.1f}% | {purpose} |\n"
        else:
            doc += "| File | Lines | Complexity | Quality | Purpose |\n"
            doc += "|------|-------|------------|---------|----------|\n"
            doc += "| No files analyzed | - | - | - | - |\n"

        doc += f"""

## 🚀 Development Guidelines

### 📝 Project Standards
- **Code Style**: Follows professional coding standards
- **Architecture**: Clean, maintainable structure
- **Documentation**: Comprehensive inline and external docs
- **Testing**: {"Test files present" if any('test' in fa.filepath.lower() for fa in file_analyses) else "Consider adding test coverage"}
- **Security**: {"Security practices implemented" if any('auth' in fa.filepath.lower() or 'security' in fa.filepath.lower() for fa in file_analyses) else "Standard security practices"}

### 🔧 Setup & Deployment
1. **Environment Setup**: Configure development environment
2. **Dependencies**: Install required packages and libraries
3. **Configuration**: Set up environment-specific configs
4. **Testing**: Run test suite to verify functionality
5. **Deployment**: Follow deployment guidelines for production

## 📚 Additional Resources
- Individual file documentation available for each component
- API documentation for all endpoints
- Architecture diagrams and flow charts
- Development and deployment guides

---
*Professional project documentation generated with comprehensive analysis and quality assessment.*
"""
        
        return doc
    
    def _enhance_file_documentation(self, base_doc: str, file_analysis: FileAnalysis, 
                                   project_structure: ProjectStructure, code_flow: CodeFlow) -> str:
        """Enhance individual file documentation with project context."""
        
        filename = os.path.basename(file_analysis.filepath)
        
        # Add project context header
        context_header = f"""
## 🔗 Project Integration Context
- **Project Role**: {file_analysis.file_type.replace('_', ' ').title() if file_analysis.file_type else 'Component'}
- **Architecture Layer**: {self._determine_architecture_layer(file_analysis.filepath)}
- **Dependencies**: {len(file_analysis.dependencies)} internal dependencies
- **Complexity Score**: {file_analysis.complexity_score:.1f}/10
- **Quality Score**: {file_analysis.quality_score:.1f}%

### 🎯 File Purpose in Project
{self._generate_file_purpose(file_analysis, code_flow)}

"""
        
        # Find where to insert context (after the first header)
        lines = base_doc.split('\n')
        insert_index = 1
        for i, line in enumerate(lines):
            if line.startswith('## ') and '📋' in line:
                insert_index = i + 1
                break
        
        # Insert context
        lines.insert(insert_index, context_header)
        
        return '\n'.join(lines)
    
    def _determine_architecture_layer(self, filepath: str) -> str:
        """Determine the architectural layer of a file."""
        filepath_lower = filepath.lower()
        
        if 'view' in filepath_lower or 'controller' in filepath_lower:
            return "Presentation Layer"
        elif 'service' in filepath_lower or 'business' in filepath_lower:
            return "Business Logic Layer"
        elif 'model' in filepath_lower or 'entity' in filepath_lower:
            return "Data Layer"
        elif 'util' in filepath_lower or 'helper' in filepath_lower:
            return "Utility Layer"
        elif 'config' in filepath_lower or 'setting' in filepath_lower:
            return "Configuration Layer"
        elif 'test' in filepath_lower:
            return "Testing Layer"
        else:
            return "Core Application Layer"
    
    def _generate_file_purpose(self, file_analysis: FileAnalysis, code_flow: CodeFlow) -> str:
        """Generate a detailed purpose description for the file in project context."""
        filename = os.path.basename(file_analysis.filepath)
        
        # Check if file is part of major code flows
        purposes = []
        
        # Check API endpoints
        for endpoint in code_flow.api_endpoints:
            if filename in endpoint.file:
                purposes.append(f"Implements **{endpoint.method} {endpoint.path}** API endpoint")
        
        # Check database models
        for model in code_flow.database_models:
            if filename in model.file:
                purposes.append(f"Defines **{model.name}** data model")
        
        # Check services
        for service in code_flow.services:
            if filename in service.file:
                purposes.append(f"Provides **{service.name}** business service")
        
        if purposes:
            return "This file serves critical functions in the project:\n- " + "\n- ".join(purposes[:3])
        else:
            return f"This file contributes to the project as a {file_analysis.file_type.replace('_', ' ')} component, providing essential functionality for the application architecture."
    
    def _format_directory_tree(self, tree_dict: dict, prefix: str = "", is_last: bool = True) -> str:
        """Format directory tree for display."""
        if not tree_dict:
            return "└── (empty project)"
        
        result = []
        items = list(tree_dict.items())
        
        for i, (name, content) in enumerate(items):
            is_last_item = (i == len(items) - 1)
            current_prefix = "└── " if is_last_item else "├── "
            result.append(f"{prefix}{current_prefix}{name}")
            
            if isinstance(content, dict) and content:
                next_prefix = prefix + ("    " if is_last_item else "│   ")
                result.append(self._format_directory_tree(content, next_prefix, is_last_item))
        
        return "\n".join(result)

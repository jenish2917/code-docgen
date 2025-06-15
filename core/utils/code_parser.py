import ast
import os
from typing import Dict, List, Any, Union, Tuple

try:
    from .llm_integration import generate_fast_documentation
except ImportError:
    def generate_fast_documentation(code_content: str, filename: str) -> Tuple[str, bool]:
        return f"# Documentation for `{filename}`\\n\\nImport error occurred.", False

def parse_codebase(filepath: str) -> Tuple[str, str]:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        llm_doc, success = generate_fast_documentation(content, os.path.basename(filepath))
        generator = "AI-Enhanced" if success else "Fallback"
        return llm_doc, generator
        
    except Exception as e:
        error_doc = f"# Error in Documentation Generation\n\nAn error occurred while parsing the file: {str(e)}"
        return error_doc, "error"

def extract_class_info(node: ast.ClassDef) -> Dict[str, Any]:
    class_info = {
        "name": node.name,
        "docstring": ast.get_docstring(node) or "No documentation available",
        "methods": [],
        "attributes": []
    }
    
    for child in node.body:
        if isinstance(child, ast.FunctionDef):
            method_info = extract_function_info(child)
            class_info["methods"].append(method_info)
        elif isinstance(child, ast.Assign):
            for target in child.targets:
                if isinstance(target, ast.Name):
                    class_info["attributes"].append({
                        "name": target.id,
                        "type": "Unknown"
                    })
    
    return class_info

def extract_function_info(node: ast.FunctionDef) -> Dict[str, Any]:
    function_info = {
        "name": node.name,
        "docstring": ast.get_docstring(node) or "No documentation available",
        "args": [],
        "returns": "Unknown"
    }
    
    for arg in node.args.args:
        arg_info = {"name": arg.arg, "type": "Unknown"}
        function_info["args"].append(arg_info)
    
    return function_info

def extract_imports(tree: ast.AST) -> List[str]:
    imports = []
    
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.append(alias.name)
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.append(node.module)
    
    return imports

def analyze_code_structure(code_content: str) -> Dict[str, Any]:
    try:
        tree = ast.parse(code_content)
        
        classes = []
        functions = []
        imports = extract_imports(tree)
        
        for node in tree.body:
            if isinstance(node, ast.ClassDef):
                class_info = extract_class_info(node)
                classes.append(class_info)
            elif isinstance(node, ast.FunctionDef):
                function_info = extract_function_info(node)
                functions.append(function_info)
        
        return {
            "classes": classes,
            "functions": functions,
            "imports": imports,
            "total_lines": len(code_content.splitlines()),
            "has_docstrings": any(ast.get_docstring(node) for node in ast.walk(tree) 
                                if isinstance(node, (ast.FunctionDef, ast.ClassDef)))
        }
        
    except SyntaxError as e:
        return {
            "error": f"Syntax error in code: {str(e)}",
            "classes": [],
            "functions": [],
            "imports": [],
            "total_lines": len(code_content.splitlines()),
            "has_docstrings": False
        }
    except Exception as e:
        return {
            "error": f"Error analyzing code: {str(e)}",
            "classes": [],
            "functions": [],
            "imports": [],
            "total_lines": 0,
            "has_docstrings": False
        }

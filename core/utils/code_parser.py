import ast
import os
from typing import Dict, List, Any, Union

def parse_codebase(filepath: str) -> str:
    """
    Parse a Python code file and generate documentation using AST and optionally LLM.
    
    Args:
        filepath: Path to the code file
        
    Returns:
        str: Markdown formatted documentation
    """
    # Basic structure to collect code metadata
    code_structure = {
        "filename": os.path.basename(filepath),
        "classes": [],
        "functions": [],
        "imports": []
    }
    
    # Parse the file with AST
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            tree = ast.parse(content)
        
        # Extract top-level classes, functions and imports
        for node in ast.iter_child_nodes(tree):
            if isinstance(node, ast.ClassDef):
                class_info = _extract_class_info(node)
                code_structure["classes"].append(class_info)
            elif isinstance(node, ast.FunctionDef):
                func_info = _extract_function_info(node)
                code_structure["functions"].append(func_info)
            elif isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom):
                import_info = _extract_import_info(node)
                code_structure["imports"].extend(import_info)
                
        # Generate markdown documentation
        return _generate_markdown_doc(code_structure, content)
        
    except Exception as e:
        return f"# Error in Documentation Generation\n\nAn error occurred while parsing the file: {str(e)}"

def _extract_class_info(node: ast.ClassDef) -> Dict[str, Any]:
    """Extract information from a class definition"""
    class_info = {
        "name": node.name,
        "docstring": ast.get_docstring(node) or "No documentation available",
        "methods": [],
        "attributes": []
    }
    
    # Extract methods and class attributes
    for item in node.body:
        if isinstance(item, ast.FunctionDef):
            method_info = _extract_function_info(item)
            class_info["methods"].append(method_info)
        elif isinstance(item, ast.Assign):
            for target in item.targets:
                if isinstance(target, ast.Name):
                    class_info["attributes"].append({
                        "name": target.id,
                        "value": ast.unparse(item.value) if hasattr(ast, 'unparse') else "Value not extractable"
                    })
    
    return class_info

def _extract_function_info(node: ast.FunctionDef) -> Dict[str, Any]:
    """Extract information from a function definition"""
    function_info = {
        "name": node.name,
        "docstring": ast.get_docstring(node) or "No documentation available",
        "parameters": [],
        "returns": None
    }
    
    # Extract parameters
    for arg in node.args.args:
        param = {
            "name": arg.arg,
            "annotation": ast.unparse(arg.annotation) if hasattr(arg, 'annotation') and arg.annotation and hasattr(ast, 'unparse') else None
        }
        function_info["parameters"].append(param)
    
    # Try to determine return type from return annotation or docstring
    if node.returns:
        function_info["returns"] = ast.unparse(node.returns) if hasattr(ast, 'unparse') else "Return type not extractable"
    
    return function_info

def _extract_import_info(node: Union[ast.Import, ast.ImportFrom]) -> List[Dict[str, str]]:
    """Extract information from import statements"""
    imports = []
    
    if isinstance(node, ast.Import):
        for name in node.names:
            imports.append({"module": name.name, "alias": name.asname})
    elif isinstance(node, ast.ImportFrom):
        module = node.module or ""
        for name in node.names:
            imports.append({"module": f"{module}.{name.name}", "alias": name.asname})
    
    return imports

def _generate_markdown_doc(code_structure: Dict[str, Any], original_content: str) -> str:
    """Generate markdown documentation from parsed code structure"""
    filename = code_structure["filename"]
    doc = f"# Documentation for `{filename}`\n\n"
    
    # Add file overview
    doc += "## Overview\n\n"
    doc += _get_file_overview(original_content, filename)
    
    # Document imports/dependencies
    if code_structure["imports"]:
        doc += "\n## Dependencies\n\n"
        for imp in code_structure["imports"]:
            alias_text = f" as {imp['alias']}" if imp['alias'] else ""
            doc += f"- `{imp['module']}{alias_text}`\n"
    
    # Document classes
    if code_structure["classes"]:
        doc += "\n## Classes\n\n"
        for cls in code_structure["classes"]:
            doc += f"### `{cls['name']}`\n\n"
            doc += f"{cls['docstring']}\n\n"
            
            # Class attributes
            if cls["attributes"]:
                doc += "#### Attributes\n\n"
                for attr in cls["attributes"]:
                    doc += f"- `{attr['name']}`: {attr['value']}\n"
                doc += "\n"
            
            # Class methods
            if cls["methods"]:
                doc += "#### Methods\n\n"
                for method in cls["methods"]:
                    params = ", ".join([p["name"] for p in method["parameters"]])
                    doc += f"##### `{method['name']}({params})`\n\n"
                    doc += f"{method['docstring']}\n\n"
                    
                    # Parameters
                    if method["parameters"]:
                        doc += "Parameters:\n"
                        for param in method["parameters"]:
                            type_str = f": `{param['annotation']}`" if param['annotation'] else ""
                            doc += f"- `{param['name']}`{type_str}\n"
                        doc += "\n"
                    
                    # Return value
                    if method["returns"]:
                        doc += f"Returns: `{method['returns']}`\n\n"
    
    # Document functions
    if code_structure["functions"]:
        doc += "\n## Functions\n\n"
        for func in code_structure["functions"]:
            params = ", ".join([p["name"] for p in func["parameters"]])
            doc += f"### `{func['name']}({params})`\n\n"
            doc += f"{func['docstring']}\n\n"
            
            # Parameters
            if func["parameters"]:
                doc += "Parameters:\n"
                for param in func["parameters"]:
                    type_str = f": `{param['annotation']}`" if param['annotation'] else ""
                    doc += f"- `{param['name']}`{type_str}\n"
                doc += "\n"
            
            # Return value
            if func["returns"]:
                doc += f"Returns: `{func['returns']}`\n\n"
    
    return doc

def _get_file_overview(content: str, filename: str) -> str:
    """
    Generate a file overview from the module docstring.
    For enhanced overview, you can integrate OpenAI later.
    """
    try:
        tree = ast.parse(content)
        module_docstring = ast.get_docstring(tree)
        if module_docstring:
            return module_docstring
        return f"This file `{filename}` contains Python code. No module-level docstring was found."
    except:
        return "Unable to generate overview."
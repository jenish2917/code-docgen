import ast

def parse_codebase(filepath):
    with open(filepath, 'r') as f:
        tree = ast.parse(f.read())
    
    docs = "# Documentation\n\n"
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            docs += f"## Function: {node.name}\n"
            docs += ast.get_docstring(node) or "No docstring provided.\n"
            docs += "\n"
        elif isinstance(node, ast.ClassDef):
            docs += f"## Class: {node.name}\n"
            docs += ast.get_docstring(node) or "No docstring provided.\n"
            docs += "\n"
    return docs

# Make minimal necessary functions available at the package level

# Core utilities
from .system_status import check_system_status
from .document_export import DocumentationGenerator
from .codebase_analyzer import parse_codebase

# LLM integration
try:
    from .llm_integration import generate_documentation
    print("✅ AI Documentation Generator with Qwen LLM integration active")
except ImportError as e:
    print(f"⚠️ LLM integration unavailable: {e}")
    def generate_documentation(*args, **kwargs):
        return "Documentation generation unavailable - LLM integration not found"
    
    def check_system_status():
        return {"status": "unavailable", "error": "Import failed"}
        
    def generate_documentation(code_content, filename):
        return f"# Documentation for `{filename}`\n\nImport error occurred.", False

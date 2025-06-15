# Make minimal necessary functions available at the package level

# Import the status check function and documentation generator
try:
    from .llm_integration import (
        check_system_status,
        generate_documentation
    )
    print("✅ AI Documentation Generator with Qwen LLM integration active")
except ImportError as e:
    # Ultimate fallback values if imports fail
    print(f"❌ LLM integration unavailable: {e}")
    
    def check_system_status():
        return {"status": "unavailable", "error": "Import failed"}
        
    def generate_documentation(code_content, filename):
        return f"# Documentation for `{filename}`\n\nImport error occurred.", False

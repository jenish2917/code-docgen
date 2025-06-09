# Make minimal necessary functions available at the package level

# Import the API key, status check function, and documentation generator
try:
    from .llm_integration import OPENROUTER_API_KEY, check_openrouter_api_status, generate_documentation_with_retry
except ImportError:
    # Fallback values if imports fail
    OPENROUTER_API_KEY = None
    
    def check_openrouter_api_status():
        return False
        
    def generate_documentation_with_retry(code_content, filename):
        return f"# Documentation for `{filename}`\n\nImport error occurred.", "error"

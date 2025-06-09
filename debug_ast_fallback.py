import os
import sys
import traceback
from pathlib import Path

# Add the root directory to the Python path
sys.path.append(str(Path(__file__).resolve().parent))

# Import the necessary modules
try:
    from core.utils.llm_integration import (
        generate_documentation_with_retry, 
        generate_documentation_with_openrouter,
        check_openrouter_api_status, 
        OPENROUTER_API_KEY
    )
    print(f"Successfully imported from llm_integration")
    print(f"API key: {OPENROUTER_API_KEY[:10]}...{OPENROUTER_API_KEY[-5:] if OPENROUTER_API_KEY and len(OPENROUTER_API_KEY) > 15 else 'INVALID'}")
except ImportError as e:
    print(f"Failed to import from llm_integration: {e}")
    traceback.print_exc()
    sys.exit(1)

def trace_documentation_generation():
    """Test generating documentation and trace the process in detail."""
    print("\n" + "=" * 80)
    print("DETAILED DOCUMENTATION GENERATION TRACE")
    print("=" * 80)
    
    # Create a simple test file
    test_file_path = Path("trace_test_file.py")
    test_code = """
def hello_world():
    \"\"\"Print a simple greeting message.\"\"\"
    print("Hello, World!")

class Person:
    \"\"\"A simple Person class.\"\"\"
    
    def __init__(self, name, age):
        \"\"\"Initialize with name and age.\"\"\"
        self.name = name
        self.age = age
        
    def greet(self):
        \"\"\"Return a greeting message.\"\"\"
        return f"Hello, my name is {self.name} and I am {self.age} years old."
"""
    with open(test_file_path, "w") as f:
        f.write(test_code)
    
    print(f"Created test file: {test_file_path}")
    
    # Read the file content
    with open(test_file_path, "r") as f:
        content = f.read()
    
    # Debug direct OpenRouter call first
    print("\nDEBUGGING DIRECT OPENROUTER CALL")
    print("-" * 40)
    try:
        direct_doc, direct_generator = generate_documentation_with_openrouter(content, str(test_file_path))
        print(f"Direct OpenRouter call result: generator={direct_generator}")
        print(f"Documentation length: {len(direct_doc)} characters")
        print(f"First 200 chars: {direct_doc[:200]}...")
    except Exception as e:
        print(f"Direct OpenRouter call failed with error: {e}")
        traceback.print_exc()

    # Now debug the retry mechanism
    print("\nDEBUGGING RETRY MECHANISM")
    print("-" * 40)
    try:
        retry_doc, retry_generator = generate_documentation_with_retry(content, str(test_file_path))
        print(f"Retry mechanism result: generator={retry_generator}")
        print(f"Documentation length: {len(retry_doc)} characters")
        print(f"First 200 chars: {retry_doc[:200]}...")
        
        # Check for AST fallback signs
        if retry_generator != "openrouter":
            print("\n⚠️ WARNING: Fallback to non-OpenRouter generator detected!")
            print(f"Generator used: {retry_generator}")
            print("Possible causes:")
            print("1. API key is invalid or expired")
            print("2. Network connectivity issues")
            print("3. OpenRouter service may be down")
            print("4. Model name might be incorrect or deprecated")
        else:
            print("\n✅ OpenRouter generator was successfully used")
    except Exception as e:
        print(f"Retry mechanism failed with error: {e}")
        traceback.print_exc()

    # Save the resulting documentation
    output_path = Path("debug_trace_output.md")
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(retry_doc)
        print(f"\nFull documentation saved to: {output_path}")
    except Exception as e:
        print(f"Failed to save documentation: {e}")

    print("\n" + "=" * 80)
    return retry_generator

if __name__ == "__main__":
    print("=" * 80)
    print("API CONNECTION TEST")
    print("=" * 80)
    api_ok = check_openrouter_api_status()
    
    if api_ok:
        generator = trace_documentation_generation()
    else:
        print("\n❌ API connection failed. Cannot proceed with documentation generation test.")
        print("Please check your API key in the .env file.")
        print("The API key should start with 'sk-or-'.")

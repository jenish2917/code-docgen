import os
import sys
import requests
import json
from pathlib import Path

# Add the project root directory to sys.path
sys.path.append(str(Path(__file__).resolve().parent))

# Import the required modules
from core.utils.code_parser import parse_codebase

def test_improved_format():
    """
    Test the improved documentation formatting directly against a sample file.
    """
    # Sample file path - use a file that exists in the workspace
    test_file_path = 'd:/code-docgen/media/test_file.py'
    
    # If test file doesn't exist, create a simple one
    if not os.path.exists(test_file_path):
        print(f"Creating test file at {test_file_path}")
        os.makedirs(os.path.dirname(test_file_path), exist_ok=True)
        with open(test_file_path, 'w') as f:
            f.write("""
def hello_world():
    \"\"\"Print hello world message.\"\"\"
    print("Hello, World!")

class TestClass:
    \"\"\"A test class for documentation generation.\"\"\"
    
    def __init__(self, name):
        \"\"\"Initialize with a name.\"\"\"
        self.name = name
    
    def greet(self):
        \"\"\"Return a greeting message.\"\"\"
        return f"Hello, {self.name}!"
""")
    
    print(f"Testing documentation generation for {test_file_path}")
    print("=" * 80)
    
    # Generate documentation
    try:
        docs, generator = parse_codebase(test_file_path)
        
        # Save the documentation to file
        output_path = "d:/code-docgen/test_improved_format_output.md"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(docs)
        
        print(f"Documentation generated with: {generator}")
        print(f"Documentation saved to: {output_path}")
        print(f"Documentation length: {len(docs)} characters")
        
        # Print preview
        print("\nDOCUMENTATION PREVIEW:\n")
        preview_length = min(1000, len(docs))
        print(docs[:preview_length] + ("..." if len(docs) > preview_length else ""))
        
    except Exception as e:
        print(f"Error generating documentation: {e}")
        import traceback
        traceback.print_exc()

def test_api_with_new_format():
    """
    Test the documentation formatting through the API.
    """
    url = "http://localhost:8000/api/generate-docs/"
    
    # Simple test code
    sample_code = '''
def calculate_sum(a, b):
    """Calculate the sum of two numbers."""
    return a + b

class Calculator:
    """A simple calculator class."""
    
    def __init__(self):
        """Initialize the calculator."""
        self.history = []
    
    def add(self, a, b):
        """Add two numbers and store in history."""
        result = a + b
        self.history.append(f"{a} + {b} = {result}")
        return result
    
    def get_history(self):
        """Return the calculation history."""
        return self.history
'''
    
    data = {
        "code": sample_code,
        "filename": "calculator.py"
    }
    
    try:
        print("Testing API with new formatting...")
        response = requests.post(url, json=data, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            documentation = result.get('documentation', '')
            
            # Save the documentation to file
            output_path = "d:/code-docgen/test_api_format_output.md"
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(documentation)
                
            print(f"API Response Status: {response.status_code}")
            print(f"Documentation saved to: {output_path}")
            print(f"Documentation length: {len(documentation)} characters")
            
            # Print preview
            print("\nAPI DOCUMENTATION PREVIEW:\n")
            preview_length = min(1000, len(documentation))
            print(documentation[:preview_length] + ("..." if len(documentation) > preview_length else ""))
            
        else:
            print(f"API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"API test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("TESTING DIRECT DOCUMENTATION GENERATION")
    print("=" * 80)
    test_improved_format()
    
    print("\n\nTESTING API DOCUMENTATION GENERATION")
    print("=" * 80)
    test_api_with_new_format()

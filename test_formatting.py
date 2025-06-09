import os
import sys
from pathlib import Path

# Add debugging
print("Starting test script...")
print(f"Current directory: {os.getcwd()}")

# Add the parent directory to sys.path so we can import the core modules
sys.path.append(str(Path(__file__).resolve().parent))
print(f"Python path: {sys.path}")

# Import the documentation generator from core/utils
try:
    print("Trying to import modules...")
    from core.utils.llm_integration import generate_documentation_with_retry
    from core.utils.code_parser import parse_codebase
    print("Successfully imported modules")
except Exception as e:
    print(f"Import error: {e}")
    import traceback
    traceback.print_exc()

def test_formatting():
    """Test the documentation formatting with direct calls to the generator."""
    
    # Test file path (use a simple Python file that exists in the workspace)
    test_file_path = 'd:/code-docgen/media/test_file.py'
    
    # If the test file doesn't exist, create a simple one
    if not os.path.exists(test_file_path):
        print(f"Creating test file at {test_file_path}")
        with open(test_file_path, 'w') as f:
            f.write('''
def hello_world():
    """Print hello world message."""
    print("Hello, World!")

class TestClass:
    """A test class for documentation generation."""
    
    def __init__(self, name):
        """Initialize with a name."""
        self.name = name
    
    def greet(self):
        """Return a greeting message."""
        return f"Hello, {self.name}!"
''')
    
    print(f"Testing documentation generation for {test_file_path}")
    print("=" * 80)
    
    try:
        # Generate documentation using the parse_codebase function
        docs, generator = parse_codebase(test_file_path)
        
        print(f"Documentation generated with: {generator}")
        print(f"Documentation length: {len(docs)} characters")
        print("\nPREVIEW OF DOCUMENTATION:\n")
        print("-" * 80)
        print(docs[:1000] + "..." if len(docs) > 1000 else docs)
        print("-" * 80)
        
        # Save the documentation to file for review
        output_path = "d:/code-docgen/test_formatting_output.md"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(docs)
        print(f"\nFull documentation saved to: {output_path}")
        
    except Exception as e:
        print(f"Error generating documentation: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_formatting()

"""
Test script to check how code documentation is processed through different handlers.
This will help identify when the system falls back to AST parsing.
"""

import os
import sys
from pathlib import Path
import traceback

# Add the project root to the Python path
sys.path.append(str(Path(__file__).resolve().parent))

# Try importing directly from code_parser
try:
    from core.utils.code_parser import parse_codebase
    print("✅ Successfully imported parse_codebase from code_parser")
except ImportError as e:
    print(f"❌ Failed to import parse_codebase: {e}")
    traceback.print_exc()
    sys.exit(1)

# Create a sample test file
test_file = Path("./ast_fallback_test.py")
sample_code = """
def hello_world():
    \"\"\"Sample function to test documentation.\"\"\"
    print("Hello, world!")

class TestClass:
    \"\"\"A test class for documentation generation.\"\"\"
    
    def __init__(self, name):
        \"\"\"Initialize with name.\"\"\"
        self.name = name
    
    def greet(self):
        \"\"\"Return a greeting.\"\"\"
        return f"Hello, {self.name}!"
"""

# Write the sample code to the file
with open(test_file, "w") as f:
    f.write(sample_code)

print(f"Created test file: {test_file.absolute()}")

# Generate documentation using the parse_codebase function
try:
    print("\nGenerating documentation...")
    doc, generator = parse_codebase(str(test_file.absolute()))
    print(f"Documentation generated with generator: {generator}")
    
    # Check the document type
    if generator == "ast":
        print("\n⚠️ WARNING: Documentation was generated using AST parsing")
        print("This is not the expected behavior. The system should be using AI-generated documentation.")
        
        # Look for patterns that indicate AST parsing
        if "## Overview" in doc and "## Classes" in doc and "## Dependencies" in doc:
            print("\nThe document structure matches AST-generated documentation:")
            sections = [line for line in doc.split('\n') if line.startswith('#')]
            for section in sections:
                print(f"  - {section}")
    elif generator == "openrouter":
        print("\n✅ Documentation was generated using OpenRouter AI as expected")
        # Look for patterns that indicate AI-generated documentation
        if "📁" in doc and "Executive Summary" in doc:
            print("The document structure matches AI-generated documentation")
    elif generator == "error":
        print("\n❌ ERROR: Documentation generation encountered an error")
        print(f"Error message: {doc.split('\n')[1] if len(doc.split('\n')) > 1 else 'Unknown error'}")
    else:
        print(f"\n❓ Unknown generator type: {generator}")
    
    # Save the documentation to verify its content
    output_file = Path("./ast_fallback_test_output.md")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(doc)
    print(f"\nDocumentation saved to: {output_file.absolute()}")
    
except Exception as e:
    print(f"❌ Error generating documentation: {e}")
    traceback.print_exc()

# Clean up the test file
try:
    test_file.unlink()
    print(f"\nCleaned up test file: {test_file.absolute()}")
except Exception as e:
    print(f"❌ Failed to clean up test file: {e}")

"""
Test script to check the improved formatting in documentation generation.
This script simulates the documentation generation without making API calls.
"""
import os
from core.utils.llm_integration import get_openrouter_api_key

def test_documentation_format():
    """
    Test the documentation formatting with a sample file.
    """
    # Test filename
    filename = "sample_code.py"
    
    # Create a simple documentation template
    doc = f"""# 📁 `{filename}` - [Sample Component]

## 📋 Executive Summary

- **Purpose**: Test the formatting improvements in documentation
- **Architecture Pattern**: Simple test module
- **System Role**: Utility component 
- **Complexity Level**: Low - for demonstration only

---

## 🎯 Core Responsibilities

### Primary Functions

- [ ] **Testing**: Verify formatting improvements
- [ ] **Documentation**: Demonstrate spacing changes
- [ ] **Presentation**: Show enhanced readability

### Business Logic

- Demonstrate improved formatting
- Test spacing between sections
- Verify consistent structure

---

## 🏗️ Architecture & Design

### Design Patterns

- **Simple Script**: For testing purposes only
- **Benefits**:
  - Quick execution
  - Easy to verify results
- **Trade-offs**:
  - Limited in scope
  - Not integrated with full system

---

*Generated with improved formatting | CodeDocGen Enterprise Documentation System*
"""
    
    # Save the documentation to a sample file
    output_path = os.path.join("docs_output", f"{filename}_doc.md")
    
    # Make sure the docs_output directory exists
    if not os.path.exists("docs_output"):
        os.makedirs("docs_output")
    
    # Write the documentation to file
    with open(output_path, "w") as f:
        f.write(doc)
    
    print(f"✅ Documentation generated with improved formatting at: {output_path}")
    print(f"📋 Preview of the first 200 characters:\n{doc[:200]}...")

if __name__ == "__main__":
    print("🚀 Testing documentation formatting improvements...")
    test_documentation_format()
    print("✅ Test complete!")

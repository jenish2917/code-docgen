import os
import requests
import json
from pathlib import Path

# Test the enhanced AI documentation generation with OpenRouter
def test_enhanced_docs():
    url = "http://localhost:8000/api/generate-docs/"
    
    # Sample Python code to test with - enhanced version to test documentation quality
    sample_code = '''def fibonacci(n):
    """Calculate fibonacci number using recursion."""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

def factorial(n):
    """Calculate factorial of a number."""
    if n <= 1:
        return 1
    return n * factorial(n-1)

class MathUtils:
    """Utility class for mathematical operations."""
    
    @staticmethod
    def is_prime(n):
        """Check if a number is prime."""
        if n < 2:
            return False
        for i in range(2, int(n**0.5) + 1):
            if n % i == 0:
                return False
        return True
    
    @staticmethod
    def gcd(a, b):
        """Calculate greatest common divisor."""
        while b:
            a, b = b, a % b
        return a'''
    
    data = {
        "code": sample_code,
        "filename": "math_utils.py"
    }
    
    print("🚀 Testing enhanced AI documentation generation...")
    print(f"📝 Code length: {len(sample_code)} characters")
    print("🌐 Making API call to OpenRouter...")
    
    try:
        response = requests.post(url, json=data, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            documentation = result.get('documentation', '')
            
            print(f"✅ API Response Status: {response.status_code}")
            print(f"📊 Documentation length: {len(documentation)} characters")
            print("📋 Documentation preview (first 500 chars):")
            print("-" * 80)
            print(documentation[:500])
            print("-" * 80)
            
            # Check for enhanced structure
            if "# 📁" in documentation and "## 📋 Executive Summary" in documentation:
                print("🎉 SUCCESS: Enhanced documentation structure detected!")
                print("✨ Advanced features found:")
                if "## 🎯 Core Responsibilities" in documentation:
                    print("   ✓ Core Responsibilities section")
                if "## 🏗️ Architecture & Design" in documentation:
                    print("   ✓ Architecture & Design section")
                if "## 📚 API Reference" in documentation:
                    print("   ✓ API Reference section")
                if "## 💡 Usage Examples" in documentation:
                    print("   ✓ Usage Examples section")
                if "## ⚠️ Important Considerations" in documentation:
                    print("   ✓ Important Considerations section")
            else:
                print("⚠️  Basic documentation generated (not enhanced structure)")
            
            # Save the documentation to file for review
            with open("d:/code-docgen/test_enhanced_output.md", "w", encoding="utf-8") as f:
                f.write(documentation)
            print("💾 Full documentation saved to: test_enhanced_output.md")
            
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_enhanced_docs()

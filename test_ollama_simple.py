#!/usr/bin/env python
"""
Simple script to test Ollama integration directly without Django
"""
import subprocess
import json

def test_ollama_direct():
    """Test Ollama directly"""
    prompt = "What is Python in one sentence?"
    command = ['ollama', 'run', 'deepseek-r1:8b', prompt]
    
    try:
        print("🧪 Testing Ollama direct integration...")
        print(f"Command: {' '.join(command)}")
        
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=60,
            encoding='utf-8',
            errors='replace'
        )
        
        if result.returncode == 0:
            print("✅ Success!")
            print(f"Response: {result.stdout[:200]}...")
            return True
        else:
            print("❌ Failed!")
            print(f"Error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def test_code_doc_generation():
    """Test code documentation generation"""
    sample_code = '''
def greet(name):
    """Simple greeting function"""
    return f"Hello, {name}!"

class Calculator:
    def add(self, a, b):
        return a + b
'''
    
    prompt = f"""You are a technical writer. Create concise documentation for this code in markdown format:

```python
{sample_code}
```

Include: Overview, Functions, Classes."""

    command = ['ollama', 'run', 'deepseek-r1:8b', prompt]
    
    try:
        print("\n🧪 Testing code documentation generation...")
        
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=90,
            encoding='utf-8',
            errors='replace'
        )
        
        if result.returncode == 0:
            print("✅ Documentation generated!")
            print("Preview:")
            print("-" * 40)
            print(result.stdout[:300] + "..." if len(result.stdout) > 300 else result.stdout)
            return True
        else:
            print("❌ Failed!")
            print(f"Error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Ollama Integration for CodeDocGen")
    print("=" * 50)
    
    test1 = test_ollama_direct()
    test2 = test_code_doc_generation() if test1 else False
    
    print("\n" + "="*50)
    print("📊 RESULTS:")
    print(f"Basic Test: {'✅ PASS' if test1 else '❌ FAIL'}")
    print(f"Code Doc Test: {'✅ PASS' if test2 else '❌ FAIL'}")
    
    if test1 and test2:
        print("\n🎉 Ollama integration is working correctly!")
        print("Your ask_deepseek function should work with these settings:")
        print("- Model: deepseek-r1:8b")
        print("- Timeout: 60-120 seconds")
        print("- Encoding: utf-8 with error handling")
    else:
        print("\n⚠️ Check Ollama installation and model availability.")

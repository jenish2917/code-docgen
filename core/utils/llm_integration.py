import os
import requests
import json
from typing import Tuple, Optional
from pathlib import Path

# API key retrieval logic with multiple fallback options
def get_api_key() -> Optional[str]:
    """
    Retrieve the DeepSeek API key from various sources with fallbacks:
    1. Environment variable
    2. apikeys.txt file
    3. Hardcoded value (only for development)
    """
    # First try environment variable
    api_key = os.environ.get("DEEPSEEK_API_KEY")
    if api_key:
        print("Using API key from environment variable")
        return api_key
    
    # Next, try apikeys.txt file
    try:
        # Find the project root directory (parent of the current script directory)
        base_dir = Path(__file__).resolve().parent.parent.parent
        api_keys_file = base_dir / "apikeys.txt"
        
        print(f"Looking for API key in file: {api_keys_file}")
        if api_keys_file.exists():
            with open(api_keys_file, "r") as f:
                file_content = f.read()
                print(f"API keys file content (first 20 chars): {file_content[:20]}...")
                
                for line in file_content.splitlines():
                    if line.strip().startswith("DEEPSEEK_API_KEY="):
                        key = line.strip().split("=", 1)[1]
                        print(f"Found API key in file: {key[:5]}...{key[-5:] if len(key) > 10 else 'INVALID'}")
                        return key
                
                print("No DEEPSEEK_API_KEY entry found in apikeys.txt")
    except Exception as e:
        print(f"Error reading API key file: {e}")
    
    # Last resort, hardcoded key (for development only)
    print("Using hardcoded API key")
    return "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"

# Set API key
DEEPSEEK_API_KEY = get_api_key()

def generate_documentation_with_deepseek(code_content: str, filename: str) -> Tuple[str, str]:
    """
    Generate documentation for code using DeepSeek AI through OpenRouter API.
    
    Args:
        code_content: The source code content as a string
        filename: The name of the file being documented
        
    Returns:
        Tuple[str, str]: Generated documentation in markdown format and the generator name ('deepseek' or 'ast')
    """
    # Check if code content is empty
    if not code_content or len(code_content.strip()) == 0:
        print("Empty code content provided, can't generate documentation")
        return None, "ast"
    
    # Check if API key is available and valid
    if not DEEPSEEK_API_KEY or len(DEEPSEEK_API_KEY) < 10:
        print("Invalid or missing DeepSeek API key")
        return None, "ast"
    
    try:
        # Log attempt
        print(f"Attempting to generate documentation for {filename} using DeepSeek AI")
        
        # Create the prompt for DeepSeek AI
        prompt = f"""You are a senior software architect and technical writer.

I will give you the full content of a code file from a project folder.

Your task is to generate high-quality, structured technical documentation that satisfies the following requirements:

🔹 OBJECTIVE
Create professional documentation that is:
- Understandable by new developers onboarding to this project
- Helpful for experienced developers maintaining the code
- Focused on explaining not just **what** the code does, but also **how** and **why**

🔹 OUTPUT STRUCTURE
Provide the documentation in **Markdown format**, structured as follows:

1. **Overview**
   - A high-level description of the purpose of the code or component
   - Where it's located in the folder structure (if known)

2. **Main Features / Responsibilities**
   - Bullet list of what the component/module/file handles

3. **Classes**
   For each class:
   - Class name
   - Purpose / role
   - Key methods (name, input, output, what it does, when it's used)

4. **Functions**
   For each top-level function:
   - Name
   - Input/output description
   - When/why it is used
   - Any edge cases or special logic

5. **Code Examples**
   - Usage examples for classes/functions if applicable

6. **Design Decisions**
   - Key architectural or implementation decisions
   - Why those decisions were made (if inferable)

7. **Dependencies**
   - External libraries or APIs used
   - Short description of how each is used

8. **Best Practices & Warnings**
   - Common pitfalls
   - Best ways to extend or safely modify the code

Here is the code to document from the file named '{filename}':

```python
{code_content}
```"""        # Print debug info before API call
        print(f"Making API call with key: {DEEPSEEK_API_KEY[:5]}...{DEEPSEEK_API_KEY[-5:]}")
        
        request_data = {
            "model": "deepseek/deepseek-r1-0528:free",
            "messages": [{"role": "user", "content": prompt[:100] + "..."}],  # Truncated for logging
            "max_tokens": 4000,
            "temperature": 0.1,
        }
        print(f"Request data: {json.dumps(request_data, indent=2)}")
        
        # Make the API call to OpenRouter using DeepSeek model
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://codedocgen.app",
                "X-Title": "CodeDocGen",
            },
            data=json.dumps({
                "model": "deepseek/deepseek-r1-0528:free",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 4000,  # Ensure we get a substantial response
                "temperature": 0.1,  # Lower temperature for more factual responses
            }),
            timeout=120  # Increased timeout for larger files
        )
          # Check if the response was successful
        if response.status_code == 200:
            result = response.json()
            print(f"DeepSeek API response JSON: {json.dumps(result, indent=2)[:500]}...")
            documentation = result["choices"][0]["message"]["content"]
            
            # Simple validation to ensure we got a proper markdown response
            if documentation and len(documentation) > 100 and "# " in documentation:
                print(f"Successfully generated documentation for {filename} using DeepSeek AI")
                
                # Add a note about the documentation generator
                documentation += "\n\n---\n*Documentation generated by DeepSeek AI through CodeDocGen*"
                return documentation, "deepseek"
            else:
                print(f"DeepSeek API returned invalid documentation format for {filename}")
                print(f"Documentation content: {documentation[:200]}...")
                return None, "ast"
        else:
            print(f"Error from DeepSeek API: {response.status_code} - {response.text}")
            return None, "ast"
    except requests.exceptions.Timeout:
        print(f"Timeout when calling DeepSeek API for {filename}")
        return None, "ast"
    except requests.exceptions.RequestException as e:
        print(f"Network error when calling DeepSeek API: {str(e)}")
        return None, "ast"
    except json.JSONDecodeError:
        print("Invalid JSON response from DeepSeek API")
        return None, "ast"
    except Exception as e:
        print(f"Exception when calling DeepSeek API: {str(e)}")
        return None, "ast"

def generate_documentation_with_retry(code_content: str, filename: str) -> Tuple[str, str]:
    """
    Generate documentation with retry logic for the DeepSeek API.
    
    Args:
        code_content: The source code content as a string
        filename: The name of the file being documented
        
    Returns:
        Tuple[str, str]: Generated documentation in markdown format and the generator name ('deepseek' or 'ast')
    """
    max_retries = 3
    retry_count = 0
    
    print(f"Attempting to generate documentation for {filename} with {max_retries} max retries")
    
    while retry_count < max_retries:
        try:
            print(f"Attempt {retry_count + 1}/{max_retries} for {filename}")
            documentation, generator = generate_documentation_with_deepseek(code_content, filename)
            
            print(f"Attempt result: documentation={documentation is not None}, generator={generator}")
            
            if documentation:
                print(f"Successful documentation generation on attempt {retry_count + 1}")
                return documentation, generator
                
            # If we get None back, retry after a delay
            print(f"Retrying API call ({retry_count + 1}/{max_retries})...")
            import time
            time.sleep(2 * (retry_count + 1))  # Exponential backoff
            retry_count += 1
        except Exception as e:
            print(f"Error in retry loop: {e}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            retry_count += 1
            import time
            time.sleep(2)
    
    # If all retries failed, fall back to AST parsing
    print("All API retries failed. Falling back to AST parsing.")
    return None, "ast"

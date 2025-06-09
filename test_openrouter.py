"""
Simple test script for OpenRouter API integration
"""
import requests
import json
import sys
from pathlib import Path

def main():
    # Read the API key
    api_key = None
    try:
        # Try environment variable first
        import os
        api_key = os.environ.get("OPENROUTER_API_KEY")
        if api_key:
            print("Using API key from environment variable")
        
        # If not in environment, try apikeys.txt file
        if not api_key:
            base_dir = Path(__file__).resolve().parent
            api_keys_file = base_dir / "apikeys.txt"
            
            print(f"Looking for API key in file: {api_keys_file}")
            if api_keys_file.exists():
                with open(api_keys_file, "r") as f:
                    for line in f.read().splitlines():
                        if "OPENROUTER_API_KEY" in line and "=" in line:
                            parts = line.strip().split("=", 1)
                            api_key = parts[1].strip()
                            if api_key.startswith("sk-or-"):
                                print(f"Found API key in file: {api_key[:10]}...{api_key[-5:]}")
                                break
    except Exception as e:
        print(f"Error reading API key: {e}")
    
    if not api_key or not api_key.startswith("sk-or-"):
        print("No valid API key found")
        return

    # Simple test for OpenRouter API
    try:
        print("Making API call to OpenRouter...")
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8000",  # Your site URL
                "X-Title": "CodeDocGen Test"  # Your app name
            },
            data=json.dumps({
                "model": "deepseek/deepseek-r1:free",  # Free tier model
                "messages": [
                    {
                        "role": "user",
                        "content": "Hello, can you generate a short docstring for a function that adds two numbers?"
                    }
                ],
                "max_tokens": 150
            }),
            timeout=30
        )
        
        print(f"Status code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print("Response content:")
            print(json.dumps(result, indent=2))
            
            # Extract the model's response
            ai_response = result["choices"][0]["message"]["content"]
            print("\nGenerated docstring:")
            print(ai_response)
        else:
            print(f"Error: {response.text}")
    
    except Exception as e:
        print(f"Error calling OpenRouter API: {e}")

if __name__ == "__main__":
    main()

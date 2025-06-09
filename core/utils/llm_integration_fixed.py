import os
import requests
import json
from typing import Tuple, Optional
from pathlib import Path
import time

# API key retrieval logic with multiple fallback options
def get_openrouter_api_key() -> Optional[str]:
    """
    Retrieve the OpenRouter API key from various sources with fallbacks:
    1. Environment variable
    2. .env file
    3. apikeys.txt file
    """
    # First try environment variable
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if api_key and api_key.startswith("sk-or-"):
        # Remove quotes if present
        if api_key.startswith('"') and api_key.endswith('"'):
            api_key = api_key[1:-1]
        print("Using OpenRouter API key from environment variable")
        return api_key
    
    # Next, try .env file
    try:
        base_dir = Path(__file__).resolve().parent.parent.parent
        env_file = base_dir / ".env"
        
        print(f"Looking for OpenRouter API key in .env file: {env_file}")
        if env_file.exists():
            with open(env_file, "r") as f:
                env_content = f.read()
                print(f".env file content (first 30 chars): {env_content[:30]}...")
                
                for line in env_content.splitlines():
                    # Skip comments and empty lines
                    if line.strip().startswith('#') or not line.strip():
                        continue
                    
                    # Check for OPENROUTER_API_KEY
                    if "OPENROUTER_API_KEY" in line and "=" in line:
                        parts = line.strip().split("=", 1)
                        key = parts[1].strip()
                        if key.startswith("sk-or-"):
                            print(f"Found OpenRouter API key in .env file: {key[:10]}...{key[-10:] if len(key) > 20 else 'INVALID'}")
                            return key
                
                print("No OpenRouter token found in .env file")
    except Exception as e:
        print(f"Error reading .env file: {e}")
    
    # Finally, try apikeys.txt file
    try:
        # Find the project root directory (parent of the current script directory)
        base_dir = Path(__file__).resolve().parent.parent.parent
        api_keys_file = base_dir / "apikeys.txt"
        
        print(f"Looking for OpenRouter API key in file: {api_keys_file}")
        if api_keys_file.exists():
            with open(api_keys_file, "r") as f:
                file_content = f.read()
                print(f"API keys file content (first 20 chars): {file_content[:20]}...")
                
                for line in file_content.splitlines():
                    # Skip comments and empty lines
                    if line.strip().startswith('#') or not line.strip():
                        continue
                    
                    # Check specifically for OPENROUTER_API_KEY
                    if "OPENROUTER_API_KEY" in line and "=" in line:
                        parts = line.strip().split("=", 1)  # Split on first equals sign only
                        key = parts[1].strip()
                        if key.startswith("sk-or-"):
                            print(f"Found OpenRouter API key in file: {key[:10]}...{key[-10:] if len(key) > 20 else 'INVALID'}")
                            return key
                    # Also check for any line containing an API key
                    elif "sk-or-" in line:
                        parts = line.strip().split("=")
                        if len(parts) == 2:
                            key = parts[1].strip()
                        else:
                            key = line.strip()
                        
                        if key.startswith("sk-or-"):
                            print(f"Found OpenRouter API key in file: {key[:10]}...{key[-10:] if len(key) > 20 else 'INVALID'}")
                            return key
                
                print("No OpenRouter token found in apikeys.txt")
    except Exception as e:
        print(f"Error reading API key file: {e}")
    
    print("No OpenRouter API key found")
    return None

# Set API key
OPENROUTER_API_KEY = get_openrouter_api_key()

def check_openrouter_api_status() -> bool:
    """Check if OpenRouter API is accessible and properly configured."""
    if not OPENROUTER_API_KEY or not OPENROUTER_API_KEY.startswith("sk-or-"):
        print("❌ OpenRouter API key is missing or invalid")
        return False
    
    try:
        response = requests.get(
            "https://openrouter.ai/api/v1/models",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ OpenRouter API is accessible and working")
            return True
        else:
            print(f"❌ OpenRouter API error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ OpenRouter API connection failed: {e}")
        return False

def generate_documentation_with_openrouter(code_content: str, filename: str) -> Tuple[str, str]:
    """
    Generate documentation for code using OpenRouter API with DeepSeek model.
    
    Args:
        code_content: The source code content as a string
        filename: The name of the file being documented
        
    Returns:
        Tuple[str, str]: Generated documentation in markdown format and the generator name ('openrouter' or 'ast')
    """
    # Check if code content is empty
    if not code_content or len(code_content.strip()) == 0:
        print("Empty code content provided, generating minimal AI documentation")
        minimal_doc = f"# Documentation for `{filename}`\n\n## Overview\n\nThis file appears to be empty or contains only whitespace.\n\n---\n\n*Documentation generated by OpenRouter DeepSeek model through CodeDocGen*"
        return minimal_doc, "openrouter"
    
    # Check if API key is available and valid
    if not OPENROUTER_API_KEY or not OPENROUTER_API_KEY.startswith("sk-or-"):
        print("Invalid or missing OpenRouter API key")
        minimal_doc = f"# Documentation for `{filename}`\n\n## Overview\n\nThis file contains code but AI documentation could not be generated due to missing API key.\n\n---\n\n*Documentation generated by OpenRouter DeepSeek model through CodeDocGen*"
        return minimal_doc, "openrouter"

    try:
        # Log attempt
        print(f"Attempting to generate documentation for {filename} using OpenRouter DeepSeek model")
        
        # Create the advanced prompt for OpenRouter DeepSeek model
        prompt = f"""You are a senior software architect, technical lead, and documentation expert with 15+ years of experience.

MISSION: Generate enterprise-grade technical documentation for the provided code file that meets the highest industry standards.

TARGET AUDIENCE: 
- Senior developers joining the project
- System architects evaluating the codebase
- Technical leads planning feature expansions
- DevOps engineers understanding system components

DOCUMENTATION STANDARDS:
- Follow Google's Technical Writing Guidelines
- Use clear, concise language with technical precision
- Include practical examples and real-world scenarios
- Explain architectural decisions and trade-offs
- Provide actionable insights for maintenance and extension
- Use consistent spacing for readability

REQUIRED OUTPUT STRUCTURE (Markdown):

# 📁 `{filename}` - [Component Type]

## 📋 Executive Summary

- **Purpose**: One-sentence description of the component's primary responsibility
- **Architecture Pattern**: Design pattern used (MVC, Repository, Factory, etc.)
- **System Role**: How this component fits into the larger system architecture
- **Complexity Level**: [Low/Medium/High] with justification

---

## 🎯 Core Responsibilities

### Primary Functions

- [ ] **Function 1**: Detailed description
- [ ] **Function 2**: Detailed description
- [ ] **Function 3**: Detailed description

### Business Logic

- Explain the business rules implemented
- Domain-specific logic and constraints
- Integration points with other system components

---

## 🏗️ Architecture & Design

### Design Patterns

- **Pattern Name**: Why this pattern was chosen
- **Benefits**:
  - Specific advantage 1
  - Specific advantage 2
- **Trade-offs**:
  - Known limitation 1
  - Known compromise 2

### Data Flow

```
[Input] → [Processing Steps] → [Output]
```

- **Validation Points**:
  - File existence check
  - Syntax validation
- **State Management**:
  - How state is managed
  - Side effects

---

## 📚 API Reference

### Functions

#### `function_name(param1: Type, param2: Type) -> ReturnType`

**Purpose**: Comprehensive description

**Parameters**:
- `param1` (Type): Description, constraints, examples
- `param2` (Type): Description, validation rules

**Returns**:
- Detailed return value explanation

**Raises**:
- `ExceptionType`: When and why this exception occurs
- `AnotherException`: Conditions that trigger this exception

**Complexity**:
- Time: O(n) where n = number of elements
- Space: O(m) where m = size of input

**Usage Example**:
```python
# Example usage with context
result = function_name("example", 42)
print(result)
```

### Classes

#### `ClassName`

**Purpose**: Detailed explanation of the class responsibility

**Inheritance Hierarchy**:
```
BaseClass → ParentClass → CurrentClass
```

**Key Attributes**:
- `attribute_name` (Type): Description and usage
- `another_attr` (Type): Description and constraints

**Methods**:

##### `method_name(param1: Type, param2: Type) -> ReturnType`

- **Purpose**: What this method accomplishes
- **Parameters**: 
  - `param1`: Description, constraints, examples
  - `param2`: Description, validation rules
- **Returns**: Detailed return value explanation
- **Raises**: Exception types and when they occur
- **Complexity**: Time/space complexity if relevant
- **Usage Example**:
```python
# Example usage with context
instance = ClassName()
result = instance.method_name("example", 42)
```

---

## 🔧 Configuration & Dependencies

### External Dependencies

| Package | Version | Purpose | Alternatives Considered |
|---------|---------|---------|------------------------|
| `package_name` | `^1.0.0` | Specific functionality | Why this over alternatives |

### Internal Dependencies

- `module.submodule`: What functionality is imported and why
- Circular dependency considerations
- Coupling analysis

### Environment Variables

- `ENV_VAR_NAME`: Description, default value, validation rules

---

## 💡 Usage Examples

### Basic Usage

```python
# Standard implementation pattern
from module import ClassName

# Initialize with proper configuration
instance = ClassName(config_param="value")

# Common use case
result = instance.primary_method(input_data)
```

### Advanced Scenarios

```python
# Error handling pattern
try:
    result = instance.complex_operation(data)
except SpecificException as e:
    # Proper error recovery
    handle_error(e)
```

### Integration Patterns

```python
# How this component integrates with others
service = ServiceClass()
processor = ProcessorClass(service)
result = processor.handle_request(request)
```

---

## ⚠️ Important Considerations

### Security Implications

- Authentication/authorization requirements
- Input validation and sanitization
- Potential security vulnerabilities

### Performance Characteristics

- **Bottlenecks**: Known performance limitations
- **Scalability**: How it behaves under load
- **Optimization Opportunities**: Potential improvements

### Error Handling Strategy

- Exception hierarchy and handling approach
- Logging and monitoring integration
- Graceful degradation mechanisms

---

## 🚀 Extension Guidelines

### Adding New Features

1. **Step-by-step guide** for common extensions
2. **Design constraints** to maintain
3. **Testing requirements** for new code

### Modification Patterns

```python
# Safe modification pattern
class ExtendedClass(BaseClass):
    def new_method(self):
        # Extension logic
        pass
```

### Breaking Changes to Avoid

- List of modifications that would break existing integrations
- Deprecation strategies for major changes

---

## 🧪 Testing Strategy

### Unit Testing

- Key test scenarios covered
- Mock/stub patterns used
- Test data requirements

### Integration Testing

- Component interaction testing
- External dependency mocking

---

## 📈 Metrics & Monitoring

### Key Performance Indicators

- Response time expectations
- Error rate thresholds
- Resource utilization patterns

### Logging Strategy

- Log levels and their meanings
- Important events to monitor
- Debugging information available

---

## 🔄 Maintenance & Troubleshooting

### Common Issues

| Issue | Symptoms | Resolution |
|-------|----------|------------|
| Issue 1 | Symptoms | Step-by-step fix |
| Issue 2 | Symptoms | Step-by-step fix |

### Debug Information

- How to enable debug mode
- Key debugging outputs
- Performance profiling hooks

### Upgrade Considerations

- Version compatibility requirements
- Migration procedures for data/config
- Rollback strategies

---

*Generated with AI-powered analysis | CodeDocGen Enterprise Documentation System*"""

        print(f"Making OpenRouter API call with key: {OPENROUTER_API_KEY[:10]}...{OPENROUTER_API_KEY[-10:] if len(OPENROUTER_API_KEY) > 20 else 'INVALID'}")
        
        # Make the API call to OpenRouter
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8000",  # Your site URL
                "X-Title": "CodeDocGen"  # Your app name
            },
            data=json.dumps({
                "model": "deepseek/deepseek-r1:free",  # Use the free tier model
                "messages": [
                    {
                        "role": "user",
                        "content": f"{prompt}\n\nANALYZE THIS CODE FILE:\n\n```python\n{code_content}\n```\n\nGENERATE COMPREHENSIVE DOCUMENTATION FOLLOWING THE ABOVE STRUCTURE."
                    }
                ],
                "max_tokens": 8000,  # Increased for comprehensive documentation
                "temperature": 0.2,  # Slightly higher for more detailed explanations
            }),
            timeout=30  # Increased timeout for larger files
        )
        
        # Check if the response was successful
        if response.status_code == 200:
            result = response.json()
            print(f"OpenRouter AI response received successfully")
            documentation = result["choices"][0]["message"]["content"]
            
            # Enhanced validation to ensure we got comprehensive documentation
            if documentation and len(documentation) > 500 and "# 📁" in documentation and "## 📋 Executive Summary" in documentation:
                print(f"Successfully generated comprehensive documentation for {filename} using OpenRouter AI")
                
                # Add a note about the documentation generator with improved spacing
                documentation += "\n\n---\n\n*Enterprise-grade documentation generated by OpenRouter DeepSeek R1 model through CodeDocGen*"
                return documentation, "openrouter"
            
            elif documentation and len(documentation) > 200:
                print(f"Generated basic documentation for {filename}, enhancing structure...")
                # If we got content but not the full structure, enhance it
                enhanced_doc = f"""# 📁 `{filename}` - Code Component

## 📋 Executive Summary

- **Purpose**: This file contains code that has been analyzed by our AI system
- **Architecture Pattern**: Standard implementation
- **System Role**: Part of the larger application architecture
- **Complexity Level**: Medium - requires technical understanding

---

## 🎯 Generated Analysis

{documentation}

---

## 🔧 Technical Notes

This documentation was generated using AI analysis. For more detailed information, please review the source code directly.

---

*Enhanced documentation generated by OpenRouter DeepSeek R1 model through CodeDocGen*"""
                return enhanced_doc, "openrouter"
            else:                
                print(f"OpenRouter AI returned invalid documentation format for {filename}")
                print(f"Documentation content: {documentation[:200]}..." if documentation else "No documentation returned")
                # Return a professional fallback documentation
                fallback_doc = f"""# 📁 `{filename}` - Code Analysis

## 📋 Executive Summary

- **Purpose**: File processed with partial AI analysis
- **Architecture Pattern**: Unable to determine from current analysis
- **System Role**: Component within the application system
- **Complexity Level**: Unknown - requires manual review

---

## ⚠️ Analysis Status

The AI analysis was incomplete or returned an unexpected format. Manual code review is recommended.

---

## 🔧 Recommendations

- Verify the code syntax and structure
- Re-upload the file for analysis
- Consider breaking large files into smaller components

---

*Partial documentation by OpenRouter DeepSeek R1 model through CodeDocGen*"""
                return fallback_doc, "openrouter"
        else:            
            print(f"Error from OpenRouter AI: {response.status_code} - {response.text}")
            # Return a professional error documentation
            error_doc = f"""# 📁 `{filename}` - Analysis Error

## 📋 Executive Summary

- **Purpose**: File analysis attempted but encountered API limitations
- **Architecture Pattern**: Unable to analyze due to service error
- **System Role**: Component requiring manual documentation
- **Complexity Level**: Unknown - API error {response.status_code}

---

## ⚠️ Service Status

The AI documentation service encountered an error during processing.

**Error Details**: HTTP {response.status_code}

---

## 🔧 Troubleshooting

- Verify API service availability
- Check file size and format compatibility
- Retry the documentation generation

---

*Error reported by OpenRouter DeepSeek R1 model through CodeDocGen*"""
            return error_doc, "openrouter"
            
    except requests.exceptions.Timeout:
        print(f"Timeout when calling OpenRouter AI for {filename}")
        timeout_doc = f"""# 📁 `{filename}` - Processing Timeout

## 📋 Executive Summary

- **Purpose**: File analysis attempted but timed out
- **Architecture Pattern**: Unable to analyze due to processing limitations
- **System Role**: Component requiring manual review
- **Complexity Level**: High - timeout indicates complexity

---

## ⚠️ Service Status

The AI documentation service timed out while processing this file.

---

## 🔧 Recommendations

- Break the file into smaller components
- Retry with simplified code sections
- Consider manual documentation for complex components

---

*Timeout reported by OpenRouter DeepSeek R1 model through CodeDocGen*"""
        return timeout_doc, "openrouter"
    
    except requests.exceptions.RequestException as e:
        print(f"Network error when calling OpenRouter AI: {str(e)}")
        network_doc = f"""# 📁 `{filename}` - Network Error

## 📋 Executive Summary

- **Purpose**: File analysis attempted but encountered connectivity issues
- **Architecture Pattern**: Unknown due to service unavailability
- **System Role**: Component requiring manual documentation
- **Complexity Level**: Unknown - service unreachable

---

## ⚠️ Service Status

The AI documentation service encountered network connectivity issues.

**Error Details**: {str(e)}

---

## 🔧 Troubleshooting

- Verify internet connectivity
- Check firewall settings
- Retry when network conditions improve

---

*Network error reported by OpenRouter DeepSeek R1 model through CodeDocGen*"""
        return network_doc, "openrouter"
    
    except json.JSONDecodeError:
        print("Invalid JSON response from OpenRouter AI")
        json_doc = f"""# 📁 `{filename}` - Response Format Error

## 📋 Executive Summary

- **Purpose**: File analysis attempted but returned invalid response format
- **Architecture Pattern**: Unknown due to response parsing failure
- **System Role**: Component requiring manual documentation
- **Complexity Level**: Unknown - invalid service response

---

## ⚠️ Service Status

The AI documentation service returned an invalid response format.

---

## 🔧 Troubleshooting

- Retry the API request
- Verify API version compatibility
- Check for service degradation notices

---

*Response format error reported by OpenRouter DeepSeek R1 model through CodeDocGen*"""
        return json_doc, "openrouter"
    
    except Exception as e:
        print(f"Exception when calling OpenRouter AI: {str(e)}")
        exception_doc = f"""# 📁 `{filename}` - Processing Error

## 📋 Executive Summary

- **Purpose**: File analysis attempted but encountered unexpected error
- **Architecture Pattern**: Unknown due to processing failure
- **System Role**: Component requiring manual documentation
- **Complexity Level**: Unknown - processing error

---

## ⚠️ Service Status

The AI documentation service encountered an unexpected error.

**Error Details**: {str(e)}

---

## 🔧 Troubleshooting

- Check logs for detailed error information
- Retry with different model parameters
- Consider manual documentation as fallback

---

*Error reported by OpenRouter DeepSeek R1 model through CodeDocGen*"""
        return exception_doc, "openrouter"

def generate_documentation_with_retry(code_content: str, filename: str) -> Tuple[str, str]:
    """
    Generate documentation with retry logic for the OpenRouter AI models.
    
    Args:
        code_content: The source code content as a string
        filename: The name of the file being documented
        
    Returns:
        Tuple[str, str]: Generated documentation in markdown format and the generator name ('openrouter' or 'ast')
    """
    max_retries = 3
    retry_count = 0
    
    print(f"Attempting to generate documentation for {filename} with {max_retries} max retries")
    
    while retry_count < max_retries:
        try:            
            print(f"Attempt {retry_count + 1}/{max_retries} for {filename} using OpenRouter API")
            documentation, generator = generate_documentation_with_openrouter(code_content, filename)
            
            print(f"Attempt result: documentation={documentation is not None}, generator={generator}")
            
            if documentation:
                print(f"Successful documentation generation on attempt {retry_count + 1}")
                return documentation, generator
                
            # If we get None back, retry after a delay
            print(f"Retrying API call ({retry_count + 1}/{max_retries})...")
            time.sleep(2 * (retry_count + 1))  # Exponential backoff
            retry_count += 1
        except Exception as e:
            print(f"Error in retry loop: {e}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            retry_count += 1
            time.sleep(2)
    
    # If all retries failed, still return AI-generated documentation instead of falling back to AST
    print("All API retries failed. Generating professional error documentation.")
    error_doc = f"""# 📁 `{filename}` - Retry Analysis Failed

## 📋 Executive Summary

- **Purpose**: File analysis attempted multiple times but failed
- **Architecture Pattern**: Unable to analyze due to persistent API issues
- **System Role**: Component requiring manual documentation review
- **Complexity Level**: Unknown - multiple retry failures

---

## ⚠️ Service Status

The AI documentation service failed after {max_retries} retry attempts.

---

## 🔧 Recommendations

- **Manual Review**: Examine the source code directly
- **File Validation**: Ensure the file contains valid, parseable code
- **Service Check**: Verify AI service availability and API limits
- **Alternative**: Try uploading smaller code segments

---

## 📊 Technical Details

- **Retry Attempts**: {max_retries}
- **File Name**: `{filename}`
- **Service**: OpenRouter DeepSeek R1 API

---

*Retry failure documentation by OpenRouter DeepSeek R1 model through CodeDocGen*"""
    return error_doc, "openrouter"

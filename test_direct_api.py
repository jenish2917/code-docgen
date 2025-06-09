import os
import requests
import json
from pathlib import Path
import argparse

def test_direct_api():
    """Test the OpenRouter API directly with a sample Python file."""
    
    # Read API key from .env file
    api_key = None
    env_file = Path("d:/code-docgen/.env")
    if env_file.exists():
        with open(env_file, "r") as f:
            for line in f:
                if "OPENROUTER_API_KEY" in line and "=" in line:
                    parts = line.strip().split("=", 1)
                    api_key = parts[1].strip()
                    if api_key.startswith('"') and api_key.endswith('"'):
                        api_key = api_key[1:-1]
                    break
    
    if not api_key:
        print("No API key found. Please set OPENROUTER_API_KEY in .env file")
        return
    
    print(f"Found API key: {api_key[:10]}...{api_key[-5:]}")
    
    # Read the test file
    test_file = Path("d:/code-docgen/test_simple.py")
    if not test_file.exists():
        print(f"Test file not found: {test_file}")
        return
    
    with open(test_file, "r") as f:
        code_content = f.read()
    
    # Create the prompt
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

# 📁 `test_simple.py` - [Component Type]

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

*Generated with AI-powered analysis | CodeDocGen Enterprise Documentation System*

ANALYZE THIS CODE FILE:

```python
{code_content}
```

GENERATE COMPREHENSIVE DOCUMENTATION FOLLOWING THE ABOVE STRUCTURE."""

    # Make the API call
    try:
        print("Making API call to OpenRouter...")
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "CodeDocGen"
            },
            json={
                "model": "deepseek/deepseek-r1:free",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 8000,
                "temperature": 0.2
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            documentation = result["choices"][0]["message"]["content"]
            
            # Add the footer
            documentation += "\n\n---\n\n*Enterprise-grade documentation generated by OpenRouter DeepSeek R1 model through CodeDocGen*"
            
            # Save the documentation
            output_file = Path("d:/code-docgen/api_test_output.md")
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(documentation)
                
            print(f"Documentation saved to {output_file}")
            print("\nDOCUMENTATION PREVIEW:\n")
            preview_length = min(1000, len(documentation))
            print(documentation[:preview_length] + ("..." if len(documentation) > preview_length else ""))
        else:
            print(f"API Error: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"API call failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_direct_api()

# 📄 test_sample_1.py

## Executive Summary
This module contains a simple function to test the performance and quality assessment of documentation generation.

## Architecture Analysis
- **Input**: A single input parameter `n` representing the position in the Fibonacci sequence.
- **Output**: The nth Fibonacci number calculated using the recursive approach.
- **Processing**: Basic text analysis and formatting capabilities for document processing.

### Example Usage

```python
>>> calculate_fibonacci(5)
5
>>> calculate_fibonacci(10)
55
```

## Class Definition

```python
class DocumentProcessor:
    """
    A simple document processor for testing documentation generation.
    
    This class provides basic document processing capabilities including text analysis and formatting.
    """

    def __init__(self, name: str):
        """
        Initialize the document processor.

        Args:
            name (str): Name of the processor
        """
        self.name = name
        self.processed_count = 0

    def process_text(self, text: str) -> str:
        """
        Process input text and return formatted version.
        
        Args:
            text (str): Input text to process
        
        Returns:
            str: Processed and formatted text
        """
        self.processed_count += 1
        return text.strip().upper()
```

## Class Methods

- **__init__(self, name: str) -> None**: Initializes the document processor with a given name.
- **process_text(self, text: str) -> str**: Processes the input text and returns a formatted version of it.

### Example Usage

```python
processor = DocumentProcessor("Documentation Processor")
print(processor.process_text("This is a simple test function for documentation generation performance testing"))
```

## Module Documentation

```python
"""
Simple test function for documentation generation performance testing
"""

def calculate_fibonacci(n: int) -> int:
    """
    Calculate the nth Fibonacci number using recursive approach.
    
    Args:
        n (int): The position in the Fibonacci sequence
        
    Returns:
        int: The nth Fibonacci number
        
    Raises:
        ValueError: If `n` is not a positive integer
    """

    if not isinstance(n, int) or n < 0:
        raise ValueError("The input must be a non-negative integer")
    
    if n == 0:
        return 0
    elif n == 1:
        return 1
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, (a + b) % 10

    return b
```
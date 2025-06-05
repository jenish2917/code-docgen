import os
from core.utils.document_export import DocumentExporter

# Test markdown content
markdown_content = """
# Test Documentation

## Overview
This is a test document to verify the document export functionality.

## Code Example
```python
def hello_world():
    print("Hello, world!")
```

## Table Example
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

## Formatting
**Bold text** and *italic text* are supported.
"""

# Test exporting to different formats
print("Testing document exports...")

# PDF export
pdf_path = DocumentExporter.create_temporary_file(markdown_content, 'pdf')
print(f"PDF created at: {pdf_path}")

# DOCX export
docx_path = DocumentExporter.create_temporary_file(markdown_content, 'docx')
print(f"DOCX created at: {docx_path}")

# HTML export
html_path = DocumentExporter.create_temporary_file(markdown_content, 'html')
print(f"HTML created at: {html_path}")

# Markdown export (unchanged)
md_path = DocumentExporter.create_temporary_file(markdown_content, 'md')
print(f"Markdown created at: {md_path}")

print("Export testing complete!")

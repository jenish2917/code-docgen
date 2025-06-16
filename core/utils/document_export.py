"""
Document export utilities for CodeDocGen
Provides comprehensive markdown to multiple format conversion with optimized performance
"""
import os
import tempfile
import time
import re
import html
from typing import Optional
from functools import lru_cache


class MarkdownConverter:
    """
    Advanced markdown to multiple format converter with performance optimizations
    
    Features:
    - Cached regex patterns for better performance
    - Optimized HTML conversion with proper syntax highlighting
    - Support for complex markdown structures
    """
    
    # Pre-compiled regex patterns for performance
    CODE_BLOCK_PATTERN = re.compile(r'```(\w+)?\n(.*?)\n```', re.DOTALL)
    INLINE_CODE_PATTERN = re.compile(r'`([^`]+)`')
    HEADER_PATTERNS = {
        1: re.compile(r'^# (.*?)$', re.MULTILINE),
        2: re.compile(r'^## (.*?)$', re.MULTILINE),
        3: re.compile(r'^### (.*?)$', re.MULTILINE),
        4: re.compile(r'^#### (.*?)$', re.MULTILINE),
        5: re.compile(r'^##### (.*?)$', re.MULTILINE),
        6: re.compile(r'^###### (.*?)$', re.MULTILINE),
    }
    BOLD_ITALIC_PATTERN = re.compile(r'\*\*\*(.*?)\*\*\*')
    BOLD_PATTERN = re.compile(r'\*\*(.*?)\*\*')
    ITALIC_PATTERN = re.compile(r'\*(.*?)\*')
    LINK_PATTERN = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
    UL_PATTERN = re.compile(r'^\s*[-*+•]\s+', re.MULTILINE)
    OL_PATTERN = re.compile(r'^\s*\d+\.\s+', re.MULTILINE)
    
    @classmethod
    def markdown_to_html(cls, markdown_content: str) -> str:
        """
        Convert markdown to clean HTML with proper formatting and performance optimization
        
        Args:
            markdown_content (str): Raw markdown content
            
        Returns:
            str: Well-formatted HTML content        """
        if not markdown_content:
            return ""
        
        html_content = markdown_content
        
        # Code blocks with syntax highlighting (handle first to avoid conflicts)
        html_content = cls.CODE_BLOCK_PATTERN.sub(
            r'<pre class="code-block"><code class="language-\1">\2</code></pre>', 
            html_content
        )
        
        # Inline code
        html_content = cls.INLINE_CODE_PATTERN.sub(r'<code class="inline-code">\1</code>', html_content)
        
        # Headers (optimized with pre-compiled patterns)
        for level, pattern in cls.HEADER_PATTERNS.items():
            html_content = pattern.sub(rf'<h{level}>\1</h{level}>', html_content)
        
        # Bold and italic (optimized order)
        html_content = cls.BOLD_ITALIC_PATTERN.sub(r'<strong><em>\1</em></strong>', html_content)
        html_content = cls.BOLD_PATTERN.sub(r'<strong>\1</strong>', html_content)
        html_content = cls.ITALIC_PATTERN.sub(r'<em>\1</em>', html_content)
        
        # Links
        html_content = cls.LINK_PATTERN.sub(r'<a href="\2">\1</a>', html_content)
        
        # Process line by line for better structure
        lines = html_content.split('\n')
        processed_lines = []
        in_ul = False
        in_ol = False
        in_code_block = False
        
        for line in lines:
            stripped_line = line.strip()
            
            # Check if we're in a code block
            if '<pre class="code-block">' in line:
                in_code_block = True
                processed_lines.append(line)
                continue
            elif '</code></pre>' in line:
                in_code_block = False
                processed_lines.append(line)
                continue
            elif in_code_block:
                processed_lines.append(line)
                continue
            
            # Handle headers (already converted)
            if any(tag in stripped_line for tag in ['<h1>', '<h2>', '<h3>', '<h4>', '<h5>', '<h6>']):
                # Close any open lists
                if in_ul:
                    processed_lines.append('</ul>')
                    in_ul = False
                if in_ol:
                    processed_lines.append('</ol>')
                    in_ol = False
                processed_lines.append(line)
                continue
            
            # Unordered lists
            if re.match(r'^\s*[-*+•]\s+', line):
                if not in_ul:
                    processed_lines.append('<ul>')
                    in_ul = True
                if in_ol:
                    processed_lines.append('</ol>')
                    in_ol = False
                item = re.sub(r'^\s*[-*+•]\s+', '', line)
                processed_lines.append(f'  <li>{item}</li>')
            # Ordered lists
            elif re.match(r'^\s*\d+\.\s+', line):
                if not in_ol:
                    processed_lines.append('<ol>')
                    in_ol = True
                if in_ul:
                    processed_lines.append('</ul>')
                    in_ul = False
                item = re.sub(r'^\s*\d+\.\s+', '', line)
                processed_lines.append(f'  <li>{item}</li>')
            else:
                # Close any open lists for non-list content
                if in_ul:
                    processed_lines.append('</ul>')
                    in_ul = False
                if in_ol:
                    processed_lines.append('</ol>')
                    in_ol = False
                
                # Handle regular content
                if stripped_line:
                    processed_lines.append(f'<p>{line}</p>')
                else:
                    processed_lines.append('')
          # Close any remaining open lists
        if in_ul:
            processed_lines.append('</ul>')
        if in_ol:
            processed_lines.append('</ol>')
        
        return '\n'.join(processed_lines)
    
    @classmethod
    def markdown_to_plain_text(cls, markdown_content: str) -> str:
        """
        Convert markdown to clean plain text with optimized regex patterns
        
        Args:
            markdown_content (str): Raw markdown content to convert
            
        Returns:
            str: Clean plain text without markdown formatting
            
        Note:
            This method strips all markdown formatting while preserving content structure
        """
        if not markdown_content:
            return ""
        
        text = markdown_content
        
        # Remove code blocks
        text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
        
        # Remove inline code
        text = re.sub(r'`([^`]+)`', r'\1', text)
        
        # Remove headers formatting
        text = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)
        
        # Remove bold and italic
        text = re.sub(r'\*\*\*(.*?)\*\*\*', r'\1', text)
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
        text = re.sub(r'\*(.*?)\*', r'\1', text)
        
        # Remove links, keep text
        text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
        
        # Remove list markers
        text = re.sub(r'^\s*[-*+]\s+', '• ', text, flags=re.MULTILINE)
        text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)
        
        # Clean up extra whitespace
        text = re.sub(r'\n\s*\n', '\n\n', text)
        text = text.strip()
        
        return text


class DocumentExporter:
    """
    Advanced document exporter supporting multiple formats with optimized performance
    
    Supported formats:
    - HTML: Full-featured with CSS styling
    - TXT: Clean plain text
    - MD: Structured Markdown
    - RTF: Rich Text Format (DOCX alternative)
    - PDF: Print-ready HTML (requires browser printing)
    
    Features:
    - Professional templates
    - Optimized file generation
    - Temporary file management
    - Cross-platform compatibility
    """
    
    @staticmethod
    def get_html_template() -> str:
        """
        Get professional HTML template for documentation
        """
        return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Documentation</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
            background: #fff;
        }}
        
        h1, h2, h3, h4, h5, h6 {{
            color: #2d3748;
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-weight: 600;
        }}
        
        h1 {{ font-size: 2.5rem; border-bottom: 3px solid #3182ce; padding-bottom: 0.5rem; }}
        h2 {{ font-size: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3rem; }}
        h3 {{ font-size: 1.5rem; }}
        h4 {{ font-size: 1.25rem; }}
        
        p {{
            margin-bottom: 1rem;
            text-align: justify;
        }}
        
        .code-block {{
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1rem 0;
            overflow-x: auto;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.5;
        }}
        
        .inline-code {{
            background: #edf2f7;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
        }}
        
        ul, ol {{
            margin: 1rem 0;
            padding-left: 2rem;
        }}
        
        li {{
            margin-bottom: 0.5rem;
        }}
        
        a {{
            color: #3182ce;
            text-decoration: none;
        }}
        
        a:hover {{
            text-decoration: underline;
        }}
        
        strong {{
            font-weight: 600;
        }}
        
        em {{
            font-style: italic;
        }}
        
        .header {{
            text-align: center;
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 3px solid #3182ce;
        }}
        
        .footer {{
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #718096;
            font-size: 0.9rem;
        }}
        
        @media print {{
            body {{ padding: 1rem; }}
            .code-block {{ break-inside: avoid; }}
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Code Documentation</h1>
        <p>Generated on {timestamp}</p>
    </div>
    
    <div class="content">
        {content}
    </div>
    
    <div class="footer">
        <p>Generated by Code Documentation Generator</p>
    </div>
</body>
</html>"""
    
    @staticmethod
    def create_temporary_file(content: str, export_format: str, filename: str = None) -> str:
        """
        Create a temporary file with the given content in the specified format.
        
        Args:
            content: The markdown content to export
            export_format: The format to export to ('txt', 'html', 'md', 'docx', 'pdf')
            filename: Optional custom filename
            
        Returns:
            str: Path to the created temporary file
        """        # Create temp directory if it doesn't exist
        temp_dir = os.path.join('media', 'temp')
        os.makedirs(temp_dir, exist_ok=True)
        
        # Generate a temporary filename
        if not filename:
            timestamp = int(time.time())
            filename = f"documentation_export_{timestamp}"
        
        temp_filename = f"{filename}.{export_format}"
        temp_path = os.path.join(temp_dir, temp_filename)
        
        converter = MarkdownConverter()
        current_time = time.strftime("%Y-%m-%d %H:%M:%S")
        
        if export_format == 'html':
            # Convert markdown to HTML and wrap in template
            html_content = converter.markdown_to_html(content)
            template = DocumentExporter.get_html_template()
            full_html = template.format(content=html_content, timestamp=current_time)
            
            with open(temp_path, 'w', encoding='utf-8') as f:
                f.write(full_html)
                
        elif export_format == 'txt':
            # Convert to clean plain text
            text_content = converter.markdown_to_plain_text(content)
            header = f"CODE DOCUMENTATION\nGenerated on: {current_time}\n{'='*50}\n\n"
            
            with open(temp_path, 'w', encoding='utf-8') as f:
                f.write(header + text_content)
                
        elif export_format == 'md':
            # Keep as markdown with header
            header = f"""# Code Documentation

**Generated on:** {current_time}

---

"""
            with open(temp_path, 'w', encoding='utf-8') as f:
                f.write(header + content)
                
        elif export_format == 'docx':
            # Create a rich text format that can be opened by Word
            # For now, create RTF format which is widely supported
            temp_path = temp_path.replace('.docx', '.rtf')
            
            # Convert markdown to plain text for RTF
            text_content = converter.markdown_to_plain_text(content)
            
            # Basic RTF format
            rtf_content = r"""{\rtf1\ansi\deff0 
{\fonttbl{\f0 Times New Roman;}}
{\colortbl;\red0\green0\blue0;\red0\green0\blue255;}
\f0\fs24
{\b\fs32 Code Documentation\par}
{\fs20 Generated on: """ + current_time + r"""\par}
\line\line
""" + text_content.replace('\n', r'\par ') + r"""
}"""
            
            with open(temp_path, 'w', encoding='utf-8') as f:
                f.write(rtf_content)
                
        elif export_format == 'pdf':
            # For PDF, create HTML first then note that PDF conversion needs additional setup
            html_content = converter.markdown_to_html(content)
            template = DocumentExporter.get_html_template()
            full_html = template.format(content=html_content, timestamp=current_time)
            
            # Save as HTML with PDF-ready styling (user can print to PDF)
            temp_path = temp_path.replace('.pdf', '_printable.html')
            
            with open(temp_path, 'w', encoding='utf-8') as f:
                f.write(full_html)
                
        else:
            # Default to markdown
            with open(temp_path, 'w', encoding='utf-8') as f:
                f.write(content)
        
        return temp_path
    
    @staticmethod
    def get_download_url(file_path: str) -> str:
        """
        Get the download URL for a temporary file
        """
        # Convert absolute path to relative URL
        if 'media' in file_path:
            relative_path = file_path.split('media')[-1].replace('\\', '/')
            return f'/media{relative_path}'
        return file_path

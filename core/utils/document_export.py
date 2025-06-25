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
        Get professional HTML template for documentation with enhanced styling
        """
        return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Documentation</title>
    <style>
        * {{
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.7;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            color: #374151;
            background: #ffffff;
            font-size: 16px;
        }}
        
        /* Professional Header */
        .header {{
            text-align: center;
            margin-bottom: 4rem;
            padding: 3rem 2rem;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(30, 64, 175, 0.1);
        }}
        
        .header h1 {{
            font-size: 3rem;
            font-weight: 700;
            margin: 0 0 1rem 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        
        .header p {{
            font-size: 1.1rem;
            margin: 0;
            opacity: 0.9;
        }}
        
        /* Table of Contents */
        .toc {{
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 2rem;
            margin: 2rem 0;
        }}
        
        .toc h2 {{
            color: #1e40af;
            font-size: 1.5rem;
            margin-top: 0;
            margin-bottom: 1.5rem;
            text-align: center;
        }}
        
        .toc ul {{
            list-style: none;
            padding-left: 0;
        }}
        
        .toc li {{
            margin-bottom: 0.5rem;
            padding-left: 1rem;
        }}
        
        .toc a {{
            color: #374151;
            text-decoration: none;
            font-weight: 500;
        }}
        
        .toc a:hover {{
            color: #1e40af;
        }}
        
        /* Enhanced Typography */
        h1, h2, h3, h4, h5, h6 {{
            color: #1e40af;
            margin-top: 3rem;
            margin-bottom: 1.5rem;
            font-weight: 600;
            line-height: 1.3;
        }}
        
        h1 {{
            font-size: 2.5rem;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 1rem;
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            padding: 1.5rem;
            border-radius: 8px;
            margin-top: 2rem;
        }}
        
        h2 {{
            font-size: 2rem;
            border-bottom: 2px solid #cbd5e1;
            padding-bottom: 0.75rem;
            background: #f8fafc;
            padding: 1rem 1.5rem 1rem 1.5rem;
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
        }}
        
        h3 {{
            font-size: 1.5rem;
            color: #3730a3;
            border-left: 3px solid #6366f1;
            padding-left: 1rem;
        }}
        
        h4 {{
            font-size: 1.25rem;
            color: #1e3a8a;
        }}
        
        h5, h6 {{
            font-size: 1.1rem;
            color: #1e40af;
        }}
        
        /* Enhanced Paragraphs */
        p {{
            margin-bottom: 1.25rem;
            text-align: justify;
            font-size: 1rem;
            line-height: 1.7;
        }}
        
        /* Professional Code Blocks */
        .code-block {{
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-left: 4px solid #3b82f6;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            overflow-x: auto;
            font-family: 'Consolas', 'Monaco', 'SF Mono', 'Menlo', 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.6;
            position: relative;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }}
        
        .code-block::before {{
            content: attr(data-language);
            position: absolute;
            top: 0.5rem;
            right: 1rem;
            background: #1e40af;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }}
        
        .code-block pre {{
            margin: 0;
            padding: 0;
            background: none;
            border: none;
            overflow: visible;
        }}
        
        .code-block code {{
            background: none;
            padding: 0;
            border-radius: 0;
            font-size: inherit;
            color: #1f2937;
        }}
        
        /* Inline Code */
        .inline-code {{
            background: #f3f4f6;
            color: #dc2626;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-family: 'Consolas', 'Monaco', 'SF Mono', 'Menlo', 'Courier New', monospace;
            font-size: 0.9em;
            font-weight: 600;
            border: 1px solid #e5e7eb;
        }}
        
        /* Enhanced Lists */
        ul, ol {{
            margin: 1.5rem 0;
            padding-left: 2rem;
        }}
        
        li {{
            margin-bottom: 0.75rem;
            line-height: 1.6;
        }}
        
        ul li {{
            position: relative;
        }}
        
        ul li::marker {{
            color: #3b82f6;
            font-weight: bold;
        }}
        
        ol li::marker {{
            color: #1e40af;
            font-weight: bold;
        }}
        
        /* Professional Links */
        a {{
            color: #2563eb;
            text-decoration: none;
            font-weight: 500;
            border-bottom: 1px solid transparent;
            transition: all 0.2s ease;
        }}
        
        a:hover {{
            color: #1d4ed8;
            border-bottom-color: #2563eb;
        }}
        
        /* Enhanced Text Formatting */
        strong {{
            font-weight: 700;
            color: #1f2937;
        }}
        
        em {{
            font-style: italic;
            color: #4b5563;
        }}
        
        /* Blockquotes */
        blockquote {{
            border-left: 4px solid #3b82f6;
            background: #eff6ff;
            margin: 1.5rem 0;
            padding: 1rem 1.5rem;
            border-radius: 0 8px 8px 0;
            font-style: italic;
            color: #1e3a8a;
        }}
        
        blockquote p {{
            margin-bottom: 0;
        }}
        
        /* Professional Footer */
        .footer {{
            margin-top: 4rem;
            padding: 2rem;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            background: #f9fafb;
            border-radius: 8px;
        }}
        
        .footer p {{
            color: #6b7280;
            font-size: 0.9rem;
            margin: 0.5rem 0;
        }}
        
        .footer .generator {{
            font-weight: 600;
            color: #374151;
            font-size: 1rem;
        }}
        
        /* Responsive Design */
        @media (max-width: 768px) {{
            body {{
                padding: 1rem;
                font-size: 14px;
            }}
            
            .header {{
                padding: 2rem 1rem;
            }}
            
            .header h1 {{
                font-size: 2rem;
            }}
            
            h1 {{ font-size: 2rem; }}
            h2 {{ font-size: 1.5rem; }}
            h3 {{ font-size: 1.25rem; }}
        }}
        
        /* Print Styles */
        @media print {{
            body {{
                padding: 1rem;
                max-width: none;
                font-size: 12pt;
                line-height: 1.4;
            }}
            
            .header {{
                background: none !important;
                color: #000 !important;
                box-shadow: none !important;
                border: 2px solid #000;
            }}
            
            .code-block {{
                break-inside: avoid;
                box-shadow: none;
                border: 1px solid #000;
            }}
            
            a {{
                color: #000 !important;
                text-decoration: underline !important;
            }}
            
            .toc {{
                break-inside: avoid;
            }}
        }}
        
        /* Syntax Highlighting Classes */
        .highlight-keyword {{ color: #7c3aed; font-weight: bold; }}
        .highlight-string {{ color: #059669; }}
        .highlight-comment {{ color: #6b7280; font-style: italic; }}
        .highlight-number {{ color: #dc2626; }}
        .highlight-function {{ color: #2563eb; font-weight: bold; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Code Documentation</h1>
        <p>Generated on {timestamp}</p>
        <p>CodeDocGen - AI-Powered Documentation Generator</p>
    </div>
    
    {toc}
    
    <div class="content">
        {content}
    </div>
    
    <div class="footer">
        <p class="generator">CodeDocGen</p>
        <p>AI-Powered Documentation Generator</p>
        <p>Document created: {timestamp}</p>
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
            # Convert markdown to HTML with professional formatting
            html_content = DocumentExporter._generate_professional_html(content)
            
            # Generate table of contents
            toc_html = DocumentExporter._generate_html_toc(content)
            
            template = DocumentExporter.get_html_template()
            full_html = template.format(
                content=html_content, 
                timestamp=current_time,
                toc=toc_html
            )
            
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
            # Create a professional RTF format that looks great in Word
            temp_path = temp_path.replace('.docx', '.rtf')
            
            # Generate professional RTF content
            rtf_content = DocumentExporter._generate_professional_rtf(content, current_time)
            
            with open(temp_path, 'w', encoding='utf-8') as f:
                f.write(rtf_content)
        elif export_format == 'pdf':
            try:
                # Import reportlab packages with proper error handling
                from reportlab.lib.pagesizes import A4
                from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Preformatted, PageBreak, Table, TableStyle
                from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
                from reportlab.lib.units import inch, cm
                from reportlab.lib import colors
                from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
                import re
                
                # Create PDF document with professional margins
                doc = SimpleDocTemplate(
                    temp_path, 
                    pagesize=A4,
                    topMargin=2.5*cm,
                    bottomMargin=2.5*cm,
                    leftMargin=2*cm,
                    rightMargin=2*cm,
                    title="Code Documentation"
                )
                
                styles = getSampleStyleSheet()
                
                # Professional custom styles
                title_style = ParagraphStyle(
                    'ProfessionalTitle',
                    parent=styles['Title'],
                    fontSize=28,
                    spaceAfter=30,
                    spaceBefore=20,
                    textColor=colors.HexColor('#1e40af'),
                    alignment=TA_CENTER,
                    fontName='Helvetica-Bold'
                )
                
                body_style = ParagraphStyle(
                    'ProfessionalBody',
                    parent=styles['Normal'],
                    fontSize=11,
                    spaceAfter=8,
                    spaceBefore=4,
                    textColor=colors.HexColor('#374151'),
                    alignment=TA_JUSTIFY,
                    fontName='Helvetica',
                    leading=14
                )
                
                code_style = ParagraphStyle(
                    'ProfessionalCode',
                    parent=styles['Code'],
                    fontSize=9,
                    fontName='Courier-Bold',
                    textColor=colors.HexColor('#1f2937'),
                    backColor=colors.HexColor('#f3f4f6'),
                    borderWidth=1,
                    borderColor=colors.HexColor('#d1d5db'),
                    borderPadding=10,
                    spaceAfter=12,
                    spaceBefore=8,
                    leftIndent=20,
                    rightIndent=20
                )
                
                story = []
                
                # Add title page
                story.append(Spacer(1, 1.5*inch))
                story.append(Paragraph("Code Documentation", title_style))
                story.append(Spacer(1, 0.3*inch))
                story.append(Paragraph(f"Generated on {current_time}", body_style))
                story.append(PageBreak())
                
                # Process markdown content
                lines = content.split('\n')
                for line in lines:
                    line = line.rstrip()
                    
                    if line.startswith('# '):
                        # H1 - Main heading
                        heading_text = line[2:].strip()
                        if heading_text:
                            story.append(Paragraph(heading_text, title_style))
                            story.append(Spacer(1, 12))
                    elif line.startswith('## '):
                        # H2 - Section heading
                        heading_text = line[3:].strip()
                        if heading_text:
                            story.append(Paragraph(heading_text, body_style))
                            story.append(Spacer(1, 8))
                    elif line.strip():
                        # Regular paragraph
                        try:
                            story.append(Paragraph(line.strip(), body_style))
                            story.append(Spacer(1, 6))
                        except Exception as e:
                            # Skip problematic lines
                            print(f"Warning: Could not format line: {e}")
                            continue
                    else:
                        # Empty line - add spacing
                        story.append(Spacer(1, 6))
                
                # Build the PDF
                doc.build(story)
                
            except ImportError as e:
                print(f"ReportLab not available: {e}, falling back to HTML")
                # Fallback to HTML if reportlab fails
                html_content = converter.markdown_to_html(content)
                template = DocumentExporter.get_html_template()
                full_html = template.format(content=html_content, timestamp=current_time, toc="")
                
                temp_path = temp_path.replace('.pdf', '_printable.html')
                with open(temp_path, 'w', encoding='utf-8') as f:
                    f.write(full_html)
            
            except Exception as e:
                print(f"PDF generation failed: {e}, falling back to HTML")
                html_content = converter.markdown_to_html(content)
                template = DocumentExporter.get_html_template()
                full_html = template.format(content=html_content, timestamp=current_time, toc="")
                
                temp_path = temp_path.replace('.pdf', '_printable.html')
                with open(temp_path, 'w', encoding='utf-8') as f:
                    f.write(full_html)
                    
        else:
            # Default to markdown
            with open(temp_path, 'w', encoding='utf-8') as f:
                f.write(content)
        
        return temp_path
                doc = SimpleDocTemplate(
                    temp_path, 
                    pagesize=A4,
                    topMargin=2.5*cm,
                    bottomMargin=2.5*cm,
                    leftMargin=2*cm,
                    rightMargin=2*cm,
                    title="Code Documentation"
                )
                
                styles = getSampleStyleSheet()
                
                # Professional custom styles
                title_style = ParagraphStyle(
                    'ProfessionalTitle',
                    parent=styles['Title'],
                    fontSize=28,
                    spaceAfter=30,
                    spaceBefore=20,
                    textColor=colors.HexColor('#1e40af'),
                    alignment=TA_CENTER,
                    fontName='Helvetica-Bold'
                )
                
                subtitle_style = ParagraphStyle(
                    'Subtitle',
                    parent=styles['Normal'],
                    fontSize=12,
                    spaceAfter=20,
                    textColor=colors.HexColor('#6b7280'),
                    alignment=TA_CENTER,
                    fontName='Helvetica'
                )
                
                heading1_style = ParagraphStyle(
                    'ProfessionalH1',
                    parent=styles['Heading1'],
                    fontSize=20,
                    spaceAfter=15,
                    spaceBefore=25,
                    textColor=colors.HexColor('#1e40af'),
                    fontName='Helvetica-Bold',
                    borderWidth=2,
                    borderColor=colors.HexColor('#3b82f6'),
                    borderPadding=8,
                    backColor=colors.HexColor('#eff6ff'),
                    leftIndent=0,
                    rightIndent=0
                )
                
                heading2_style = ParagraphStyle(
                    'ProfessionalH2',
                    parent=styles['Heading2'],
                    fontSize=16,
                    spaceAfter=12,
                    spaceBefore=18,
                    textColor=colors.HexColor('#1e40af'),
                    fontName='Helvetica-Bold',
                    borderWidth=1,
                    borderColor=colors.HexColor('#cbd5e1'),
                    borderPadding=5,
                    backColor=colors.HexColor('#f8fafc')
                )
                
                heading3_style = ParagraphStyle(
                    'ProfessionalH3',
                    parent=styles['Heading3'],
                    fontSize=14,
                    spaceAfter=10,
                    spaceBefore=15,
                    textColor=colors.HexColor('#3730a3'),
                    fontName='Helvetica-Bold'
                )
                
                body_style = ParagraphStyle(
                    'ProfessionalBody',
                    parent=styles['Normal'],
                    fontSize=11,
                    spaceAfter=8,
                    spaceBefore=4,
                    textColor=colors.HexColor('#374151'),
                    alignment=TA_JUSTIFY,
                    fontName='Helvetica',
                    leading=14
                )
                
                code_style = ParagraphStyle(
                    'ProfessionalCode',
                    parent=styles['Code'],
                    fontSize=9,
                    fontName='Courier-Bold',
                    textColor=colors.HexColor('#1f2937'),
                    backColor=colors.HexColor('#f3f4f6'),
                    borderWidth=1,
                    borderColor=colors.HexColor('#d1d5db'),
                    borderPadding=10,
                    spaceAfter=12,
                    spaceBefore=8,
                    leftIndent=20,
                    rightIndent=20
                )
                
                list_style = ParagraphStyle(
                    'ProfessionalList',
                    parent=styles['Normal'],
                    fontSize=11,
                    spaceAfter=4,
                    spaceBefore=2,
                    textColor=colors.HexColor('#374151'),
                    fontName='Helvetica',
                    leftIndent=20,
                    bulletIndent=10
                )
                
                story = []
                
                # Professional title page
                story.append(Spacer(1, 1.5*inch))
                story.append(Paragraph("Code Documentation", title_style))
                story.append(Spacer(1, 0.3*inch))
                story.append(Paragraph(f"Generated on {current_time}", subtitle_style))
                story.append(Spacer(1, 0.2*inch))
                story.append(Paragraph("CodeDocGen - AI-Powered Documentation Generator", subtitle_style))
                
                # Add a professional separator
                separator_data = [['', '', '']]
                separator_table = Table(separator_data, colWidths=[6*cm, 1*cm, 6*cm])
                separator_table.setStyle(TableStyle([
                    ('LINEBELOW', (0, 0), (0, 0), 2, colors.HexColor('#3b82f6')),
                    ('LINEBELOW', (2, 0), (2, 0), 2, colors.HexColor('#3b82f6')),
                ]))
                story.append(Spacer(1, 1*inch))
                story.append(separator_table)
                story.append(PageBreak())
                
                # Add Table of Contents
                headings = DocumentExporter._extract_headings(content)
                if headings:
                    toc_title_style = ParagraphStyle(
                        'TOCTitle',
                        parent=styles['Heading1'],
                        fontSize=18,
                        textColor=colors.HexColor('#1e40af'),
                        spaceAfter=20,
                        alignment=TA_CENTER,
                        fontName='Helvetica-Bold'
                    )
                    
                    toc_entry_style = ParagraphStyle(
                        'TOCEntry',
                        parent=styles['Normal'],
                        fontSize=11,
                        textColor=colors.HexColor('#374151'),
                        spaceAfter=6,
                        fontName='Helvetica'
                    )
                    
                    story.append(Paragraph("Table of Contents", toc_title_style))
                    story.append(Spacer(1, 0.3*inch))
                    
                    for heading in headings:
                        indent = "    " * (heading['level'] - 1)
                        entry_text = f"{indent}{heading['text']}"
                        story.append(Paragraph(entry_text, toc_entry_style))
                    
                    story.append(PageBreak())
                
                # Process markdown content with advanced formatting
                lines = content.split('\n')
                current_code_block = []
                in_code_block = False
                code_language = ""
                current_list_items = []
                in_list = False
                list_counter = 0
                
                for line in lines:
                    line = line.rstrip()
                    
                    # Handle code blocks
                    if line.startswith('```'):
                        if in_code_block:
                            # End code block
                            if current_code_block:
                                try:
                                    code_text = '\n'.join(current_code_block)
                                    # Add language label if available
                                    if code_language:
                                        lang_label = f"<b><font color='#1e40af'>{code_language.upper()} Code:</font></b>"
                                        story.append(Paragraph(lang_label, body_style))
                                        story.append(Spacer(1, 5))
                                    
                                    # Format code with proper escaping
                                    code_text = code_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                                    story.append(Preformatted(code_text, code_style))
                                    story.append(Spacer(1, 8))
                                except Exception as e:
                                    print(f"Warning: Could not format code block: {e}")
                                    # Add plain text version as fallback
                                    story.append(Paragraph("<i>Code block omitted due to formatting issues</i>", body_style))
                                    story.append(Spacer(1, 8))
                            
                            current_code_block = []
                            in_code_block = False
                            code_language = ""
                        else:
                            # Start code block
                            in_code_block = True
                            if len(line) > 3:
                                code_language = line[3:].strip()
                        continue
                    
                    if in_code_block:
                        current_code_block.append(line)
                        continue
                    
                    # Handle different markdown elements
                    if line.startswith('# '):
                        # H1 - Main heading
                        heading_text = line[2:].strip()
                        if heading_text:
                            story.append(Paragraph(heading_text, heading1_style))
                            story.append(Spacer(1, 5))
                    
                    elif line.startswith('## '):
                        # H2 - Section heading
                        heading_text = line[3:].strip()
                        if heading_text:
                            story.append(Paragraph(heading_text, heading2_style))
                            story.append(Spacer(1, 4))
                    
                    elif line.startswith('### '):
                        # H3 - Subsection heading
                        heading_text = line[4:].strip()
                        if heading_text:
                            story.append(Paragraph(heading_text, heading3_style))
                            story.append(Spacer(1, 3))
                    
                    elif line.startswith('#### ') or line.startswith('##### ') or line.startswith('###### '):
                        # H4, H5, H6
                        heading_text = re.sub(r'^#+\s*', '', line).strip()
                        if heading_text:
                            story.append(Paragraph(heading_text, heading3_style))
                            story.append(Spacer(1, 3))
                    
                    elif line.startswith('- ') or line.startswith('* ') or line.startswith('+ '):
                        # Bullet points
                        item_text = line[2:].strip()
                        if item_text:
                            try:
                                # Handle inline formatting with proper error handling
                                formatted_text = DocumentExporter._format_inline_text(item_text)
                                bullet_text = f"• {formatted_text}"
                                story.append(Paragraph(bullet_text, list_style))
                            except Exception as e:
                                # Fallback for problematic list items
                                print(f"Warning: Could not format list item: {e}")
                                # Use plaintext as fallback
                                plain_text = item_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                                bullet_text = f"• {plain_text}"
                                story.append(Paragraph(bullet_text, list_style))
                    
                    elif re.match(r'^\d+\.\s+', line):
                        # Numbered lists
                        item_text = re.sub(r'^\d+\.\s+', '', line).strip()
                        if item_text:
                            try:
                                # Handle inline formatting with proper error handling
                                formatted_text = DocumentExporter._format_inline_text(item_text)
                                list_counter += 1
                                numbered_text = f"{list_counter}. {formatted_text}"
                                story.append(Paragraph(numbered_text, list_style))
                            except Exception as e:
                                # Fallback for problematic list items
                                print(f"Warning: Could not format numbered list item: {e}")
                                # Use plaintext as fallback
                                plain_text = item_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                                numbered_text = f"{list_counter}. {plain_text}"
                                story.append(Paragraph(numbered_text, list_style))
                    
                    elif line.startswith('>'):
                        # Blockquotes
                        quote_text = line[1:].strip()
                        if quote_text:
                            try:
                                quote_text = DocumentExporter._format_inline_text(quote_text)
                                quote_style = ParagraphStyle(
                                    'Quote',
                                    parent=body_style,
                                    leftIndent=30,
                                    borderWidth=1,
                                    borderColor=colors.HexColor('#3b82f6'),
                                    borderPadding=10,
                                    backColor=colors.HexColor('#eff6ff'),
                                    fontName='Helvetica-Oblique'
                                )
                                story.append(Paragraph(f'"{quote_text}"', quote_style))
                                story.append(Spacer(1, 6))
                            except Exception as e:
                                # Fallback for problematic blockquotes
                                print(f"Warning: Could not format blockquote: {e}")
                                plain_text = quote_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                                story.append(Paragraph(f'"{plain_text}"', quote_style))
                                story.append(Spacer(1, 6))
                    
                    elif line.strip():
                        # Regular paragraph
                        para_text = line.strip()
                        if para_text:
                            # Handle special characters and formatting safely
                            try:
                                formatted_text = DocumentExporter._format_inline_text(para_text)
                                story.append(Paragraph(formatted_text, body_style))
                                story.append(Spacer(1, 3))
                            except Exception as e:
                                # Fallback for problematic paragraphs
                                print(f"Warning: Could not format paragraph: {e}")
                                # Use plaintext as fallback
                                plain_text = para_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                                story.append(Paragraph(plain_text, body_style))
                                story.append(Spacer(1, 3))
                    
                    else:
                        # Empty line - add spacing
                        story.append(Spacer(1, 8))
                
                # Handle any remaining code block
                if in_code_block and current_code_block:
                    code_text = '\n'.join(current_code_block)
                    if code_language:
                        lang_label = f"<b><font color='#1e40af'>{code_language.upper()} Code:</font></b>"
                        story.append(Paragraph(lang_label, body_style))
                        story.append(Spacer(1, 5))
                    code_text = code_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                    story.append(Preformatted(code_text, code_style))
                
                # Professional footer page
                story.append(PageBreak())
                story.append(Spacer(1, 2*inch))
                
                footer_style = ParagraphStyle(
                    'Footer',
                    parent=styles['Normal'],
                    fontSize=10,
                    textColor=colors.HexColor('#6b7280'),
                    alignment=TA_CENTER,
                    fontName='Helvetica'
                )
                
                story.append(Paragraph("Generated by CodeDocGen", footer_style))
                story.append(Spacer(1, 0.2*inch))
                story.append(Paragraph("AI-Powered Documentation Generator", footer_style))
                story.append(Spacer(1, 0.3*inch))
                story.append(Paragraph(f"Document created: {current_time}", footer_style))
                
                # Build the professional PDF
                doc.build(story)
                
            except ImportError as e:
                print(f"ReportLab not available: {e}, falling back to HTML")
                # Log detailed error for production debugging
                import logging
                logging.error(f"PDF generation ImportError: {e}")
                
                # Generate HTML TOC as fallback
                toc_html = ""
                headings = DocumentExporter._extract_headings(content)
                if headings:
                    toc_html = "<div class='toc'><h2>Table of Contents</h2><ul>"
                    for heading in headings:
                        indent = "&nbsp;&nbsp;" * (heading['level'] - 1)
                        toc_html += f"<li>{indent}<a href='#{heading['anchor']}'>{heading['text']}</a></li>"
                    toc_html += "</ul></div>"
                
                # Fallback to HTML if reportlab fails
                html_content = converter.markdown_to_html(content)
                template = DocumentExporter.get_html_template()
                full_html = template.format(content=html_content, timestamp=current_time, toc=toc_html)            
                temp_path = temp_path.replace('.pdf', '_printable.html')
                with open(temp_path, 'w', encoding='utf-8') as f:
                    f.write(full_html)
            
            except Exception as e:
                print(f"PDF generation failed: {e}, falling back to HTML")
                # Log detailed error stack trace for production debugging
                import traceback
                import logging
                logging.error(f"PDF generation error: {e}")
                logging.error(traceback.format_exc())
                
                # Create simplified HTML as a robust fallback
                try:
                    # Generate HTML TOC as fallback
                    toc_html = ""
                    headings = DocumentExporter._extract_headings(content)
                    if headings:
                        toc_html = "<div class='toc'><h2>Table of Contents</h2><ul>"
                        for heading in headings:
                            indent = "&nbsp;&nbsp;" * (heading['level'] - 1)
                            toc_html += f"<li>{indent}<a href='#{heading['anchor']}'>{heading['text']}</a></li>"
                        toc_html += "</ul></div>"
                    
                    html_content = converter.markdown_to_html(content)
                    template = DocumentExporter.get_html_template()
                    full_html = template.format(content=html_content, timestamp=current_time, toc=toc_html)
                    
                    # Save as HTML with PDF-ready styling
                    temp_path = temp_path.replace('.pdf', '_printable.html')
                    with open(temp_path, 'w', encoding='utf-8') as f:
                        f.write(full_html)
                except Exception as fallback_error:
                    # Ultimate fallback if even HTML generation fails
                    logging.error(f"HTML fallback also failed: {fallback_error}")
                    
                        # Create a minimal HTML file
                    minimal_html = f"""<!DOCTYPE html>
<html>
<head><title>Documentation</title></head>
<body>
<h1>Code Documentation</h1>
<p>Generated on {current_time}</p>
<p>Error converting to PDF. Please try different format.</p>
<pre>{content[:1000]}...</pre>
</body>
</html>"""
                    
                    temp_path = temp_path.replace('.pdf', '_error.html')
                    with open(temp_path, 'w', encoding='utf-8') as f:
                        f.write(minimal_html)
                doc = SimpleDocTemplate(
                    temp_path, 
                    pagesize=A4,
                    topMargin=2.5*cm,
                    bottomMargin=2.5*cm,
                    leftMargin=2*cm,
                    rightMargin=2*cm,
                    title="Code Documentation"
                )
                
                styles = getSampleStyleSheet()
                
                # Professional custom styles
                title_style = ParagraphStyle(
                    'ProfessionalTitle',
                    parent=styles['Title'],
                    fontSize=28,
                    spaceAfter=30,
                    spaceBefore=20,
                    textColor=colors.HexColor('#1e40af'),
                    alignment=TA_CENTER,
                    fontName='Helvetica-Bold'
                )
                
                subtitle_style = ParagraphStyle(
                    'Subtitle',
                    parent=styles['Normal'],
                    fontSize=12,
                    spaceAfter=20,
                    textColor=colors.HexColor('#6b7280'),
                    alignment=TA_CENTER,
                    fontName='Helvetica'
                )
                
                heading1_style = ParagraphStyle(
                    'ProfessionalH1',
                    parent=styles['Heading1'],
                    fontSize=20,
                    spaceAfter=15,
                    spaceBefore=25,
                    textColor=colors.HexColor('#1e40af'),
                    fontName='Helvetica-Bold',
                    borderWidth=2,
                    borderColor=colors.HexColor('#3b82f6'),
                    borderPadding=8,
                    backColor=colors.HexColor('#eff6ff'),
                    leftIndent=0,
                    rightIndent=0
                )
                
                heading2_style = ParagraphStyle(
                    'ProfessionalH2',
                    parent=styles['Heading2'],
                    fontSize=16,
                    spaceAfter=12,
                    spaceBefore=18,
                    textColor=colors.HexColor('#1e40af'),
                    fontName='Helvetica-Bold',
                    borderWidth=1,
                    borderColor=colors.HexColor('#cbd5e1'),
                    borderPadding=5,
                    backColor=colors.HexColor('#f8fafc')
                )
                
                heading3_style = ParagraphStyle(
                    'ProfessionalH3',
                    parent=styles['Heading3'],
                    fontSize=14,
                    spaceAfter=10,
                    spaceBefore=15,
                    textColor=colors.HexColor('#3730a3'),
                    fontName='Helvetica-Bold'
                )
                
                body_style = ParagraphStyle(
                    'ProfessionalBody',
                    parent=styles['Normal'],
                    fontSize=11,
                    spaceAfter=8,
                    spaceBefore=4,
                    textColor=colors.HexColor('#374151'),
                    alignment=TA_JUSTIFY,
                    fontName='Helvetica',
                    leading=14
                )
                
                code_style = ParagraphStyle(
                    'ProfessionalCode',
                    parent=styles['Code'],
                    fontSize=9,
                    fontName='Courier-Bold',
                    textColor=colors.HexColor('#1f2937'),
                    backColor=colors.HexColor('#f3f4f6'),
                    borderWidth=1,
                    borderColor=colors.HexColor('#d1d5db'),
                    borderPadding=10,
                    spaceAfter=12,
                    spaceBefore=8,
                    leftIndent=20,
                    rightIndent=20
                )
                
                list_style = ParagraphStyle(
                    'ProfessionalList',
                    parent=styles['Normal'],
                    fontSize=11,
                    spaceAfter=4,
                    spaceBefore=2,
                    textColor=colors.HexColor('#374151'),
                    fontName='Helvetica',
                    leftIndent=20,
                    bulletIndent=10
                )
                
                story = []
                
                # Professional title page
                story.append(Spacer(1, 1.5*inch))
                story.append(Paragraph("Code Documentation", title_style))
                story.append(Spacer(1, 0.3*inch))
                story.append(Paragraph(f"Generated on {current_time}", subtitle_style))
                story.append(Spacer(1, 0.2*inch))
                story.append(Paragraph("CodeDocGen - AI-Powered Documentation Generator", subtitle_style))
                
                # Add a professional separator
                separator_data = [['', '', '']]
                separator_table = Table(separator_data, colWidths=[6*cm, 1*cm, 6*cm])
                separator_table.setStyle(TableStyle([
                    ('LINEBELOW', (0, 0), (0, 0), 2, colors.HexColor('#3b82f6')),
                    ('LINEBELOW', (2, 0), (2, 0), 2, colors.HexColor('#3b82f6')),
                ]))
                story.append(Spacer(1, 1*inch))
                story.append(separator_table)
                story.append(PageBreak())
                
                # Add Table of Contents
                headings = DocumentExporter._extract_headings(content)
                if headings:
                    toc_title_style = ParagraphStyle(
                        'TOCTitle',
                        parent=styles['Heading1'],
                        fontSize=18,
                        textColor=colors.HexColor('#1e40af'),
                        spaceAfter=20,
                        alignment=TA_CENTER,
                        fontName='Helvetica-Bold'
                    )
                    
                    toc_entry_style = ParagraphStyle(
                        'TOCEntry',
                        parent=styles['Normal'],
                        fontSize=11,
                        textColor=colors.HexColor('#374151'),
                        spaceAfter=6,
                        fontName='Helvetica'
                    )
                    
                    story.append(Paragraph("Table of Contents", toc_title_style))
                    story.append(Spacer(1, 0.3*inch))
                    
                    for heading in headings:
                        indent = "    " * (heading['level'] - 1)
                        entry_text = f"{indent}{heading['text']}"
                        story.append(Paragraph(entry_text, toc_entry_style))
                    
                    story.append(PageBreak())
                
                # Process markdown content with advanced formatting
                lines = content.split('\n')
                current_code_block = []
                in_code_block = False
                code_language = ""
                current_list_items = []
                in_list = False
                list_counter = 0
                
                for i, line in enumerate(lines):
                    line = line.rstrip()
                    
                    # Handle code blocks
                    if line.startswith('```'):
                        if in_code_block:
                            # End code block
                            if current_code_block:
                                try:
                                    code_text = '\n'.join(current_code_block)
                                    # Add language label if available
                                    if code_language:
                                        lang_label = f"<b><font color='#1e40af'>{code_language.upper()} Code:</font></b>"
                                        story.append(Paragraph(lang_label, body_style))
                                        story.append(Spacer(1, 5))
                                    
                                    # Format code with proper escaping
                                    code_text = code_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                                    story.append(Preformatted(code_text, code_style))
                                    story.append(Spacer(1, 8))
                                except Exception as e:
                                    print(f"Warning: Could not format code block: {e}")
                                    # Add plain text version as fallback
                                    story.append(Paragraph("<i>Code block omitted due to formatting issues</i>", body_style))
                                    story.append(Spacer(1, 8))
                            
                            current_code_block = []
                            in_code_block = False
                            code_language = ""
                        else:
                            # Start code block
                            in_code_block = True
                            if len(line) > 3:
                                code_language = line[3:].strip()
                        continue
                    
                    if in_code_block:
                        current_code_block.append(line)
                        continue
            
            # Handle different markdown elements
            if line.startswith('# '):
                # H1 - Main heading
                heading_text = line[2:].strip()
                if heading_text:
                    story.append(Paragraph(heading_text, heading1_style))
                    story.append(Spacer(1, 5))
            
            elif line.startswith('## '):
                # H2 - Section heading
                heading_text = line[3:].strip()
                if heading_text:
                    story.append(Paragraph(heading_text, heading2_style))
                    story.append(Spacer(1, 4))
            
            elif line.startswith('### '):
                # H3 - Subsection heading
                heading_text = line[4:].strip()
                if heading_text:
                    story.append(Paragraph(heading_text, heading3_style))
                    story.append(Spacer(1, 3))
            
            elif line.startswith('#### ') or line.startswith('##### ') or line.startswith('###### '):
                # H4, H5, H6
                heading_text = re.sub(r'^#+\s*', '', line).strip()
                if heading_text:
                    story.append(Paragraph(heading_text, heading3_style))
                    story.append(Spacer(1, 3))
            
            elif line.startswith('- ') or line.startswith('* ') or line.startswith('+ '):
                # Bullet points
                item_text = line[2:].strip()
                if item_text:
                    try:
                        # Handle inline formatting with proper error handling
                        formatted_text = DocumentExporter._format_inline_text(item_text)
                        bullet_text = f"• {formatted_text}"
                        story.append(Paragraph(bullet_text, list_style))
                    except Exception as e:
                        # Fallback for problematic list items
                        print(f"Warning: Could not format list item: {e}")
                        # Use plaintext as fallback
                        plain_text = item_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                        bullet_text = f"• {plain_text}"
                        story.append(Paragraph(bullet_text, list_style))
            
            elif re.match(r'^\d+\.\s+', line):
                # Numbered lists
                item_text = re.sub(r'^\d+\.\s+', '', line).strip()
                if item_text:
                    try:
                        # Handle inline formatting with proper error handling
                        formatted_text = DocumentExporter._format_inline_text(item_text)
                        list_counter += 1
                        numbered_text = f"{list_counter}. {formatted_text}"
                        story.append(Paragraph(numbered_text, list_style))
                    except Exception as e:
                        # Fallback for problematic list items
                        print(f"Warning: Could not format numbered list item: {e}")
                        # Use plaintext as fallback
                        plain_text = item_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                        numbered_text = f"{list_counter}. {plain_text}"
                        story.append(Paragraph(numbered_text, list_style))
            
            elif line.startswith('>'):
                # Blockquotes
                quote_text = line[1:].strip()
                if quote_text:
                    try:
                        quote_text = DocumentExporter._format_inline_text(quote_text)
                        quote_style = ParagraphStyle(
                            'Quote',
                            parent=body_style,
                            leftIndent=30,
                            borderWidth=1,
                            borderColor=colors.HexColor('#3b82f6'),
                            borderPadding=10,
                            backColor=colors.HexColor('#eff6ff'),
                            fontName='Helvetica-Oblique'
                        )
                        story.append(Paragraph(f'"{quote_text}"', quote_style))
                        story.append(Spacer(1, 6))
                    except Exception as e:
                        # Fallback for problematic blockquotes
                        print(f"Warning: Could not format blockquote: {e}")
                        plain_text = quote_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                        story.append(Paragraph(f'"{plain_text}"', quote_style))
                        story.append(Spacer(1, 6))
            
            elif line.strip():
                # Regular paragraph
                para_text = line.strip()
                if para_text:
                    # Handle special characters and formatting safely
                    try:
                        formatted_text = DocumentExporter._format_inline_text(para_text)
                        story.append(Paragraph(formatted_text, body_style))
                        story.append(Spacer(1, 3))
                    except Exception as e:
                        # Fallback for problematic paragraphs
                        print(f"Warning: Could not format paragraph: {e}")
                        # Use plaintext as fallback
                        plain_text = para_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                        story.append(Paragraph(plain_text, body_style))
                        story.append(Spacer(1, 3))
                    
                    else:
                        # Empty line - add spacing
                        story.append(Spacer(1, 8))
                
                # Handle any remaining code block
                if in_code_block and current_code_block:
                    code_text = '\n'.join(current_code_block)
                    if code_language:
                        lang_label = f"<b><font color='#1e40af'>{code_language.upper()} Code:</font></b>"
                        story.append(Paragraph(lang_label, body_style))
                        story.append(Spacer(1, 5))
                    code_text = code_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                    story.append(Preformatted(code_text, code_style))
                
                # Professional footer page
                story.append(PageBreak())
                story.append(Spacer(1, 2*inch))
                
                footer_style = ParagraphStyle(
                    'Footer',
                    parent=styles['Normal'],
                    fontSize=10,
                    textColor=colors.HexColor('#6b7280'),
                    alignment=TA_CENTER,
                    fontName='Helvetica'
                )
                
                story.append(Paragraph("Generated by CodeDocGen", footer_style))
                story.append(Spacer(1, 0.2*inch))
                story.append(Paragraph("AI-Powered Documentation Generator", footer_style))
                story.append(Spacer(1, 0.3*inch))
                story.append(Paragraph(f"Document created: {current_time}", footer_style))
                
                # Build the professional PDF
                doc.build(story)
                
            except ImportError as e:
                print(f"ReportLab not available: {e}, falling back to HTML")
                # Fallback to HTML if reportlab fails
                html_content = converter.markdown_to_html(content)
                template = DocumentExporter.get_html_template()
                full_html = template.format(content=html_content, timestamp=current_time, toc="")
                
                temp_path = temp_path.replace('.pdf', '_printable.html')
                with open(temp_path, 'w', encoding='utf-8') as f:
                    f.write(full_html)
            
            except Exception as e:
                print(f"PDF generation failed: {e}, falling back to HTML")
                html_content = converter.markdown_to_html(content)
                template = DocumentExporter.get_html_template()
                full_html = template.format(content=html_content, timestamp=current_time, toc="")
                
                # Save as HTML with PDF-ready styling
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
        # Convert absolute path to relative URL for the download endpoint
        if 'media' in file_path:
            relative_path = file_path.split('media')[-1].replace('\\', '/').lstrip('/')
            return f'/api/download/{relative_path}'
        return file_path
    
    @staticmethod
    def _format_inline_text(text):
        """
        Format inline markdown elements like bold, italic, code, and links
        with improved error handling and character escaping
        """
        if not text:
            return ""
            
        try:
            # First, escape HTML special characters
            text = text.replace('&', '&amp;')
            text = text.replace('<', '&lt;').replace('>', '&gt;')
            
            # Process inline code blocks (with proper handling for special characters)
            def code_replacer(match):
                try:
                    code_content = match.group(1)
                    # Further escape any characters that might cause issues
                    code_content = code_content.replace('"', '&quot;').replace("'", "&#39;")
                    return f'<font name="Courier" color="#1f2937" backColor="#f3f4f6">{code_content}</font>'
                except Exception:
                    # If anything goes wrong, return the original match
                    return f'`{match.group(1)}`'
                
            text = re.sub(r'`([^`]+)`', code_replacer, text)
            
            # Handle bold and italic with improved regex
            text = re.sub(r'\*\*\*(.*?)\*\*\*', r'<b><i>\1</i></b>', text)  # Bold italic
            text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)  # Bold
            text = re.sub(r'\*(.*?)\*(?![*])', r'<i>\1</i>', text)  # Italic (avoiding partial bold matches)
            
            # Handle underline (sometimes used in markdown)
            text = re.sub(r'__(.*?)__', r'<u>\1</u>', text)
            
            # Handle strikethrough
            text = re.sub(r'~~(.*?)~~', r'<strike>\1</strike>', text)
            
            # Handle links with proper escaping
            def link_replacer(match):
                try:
                    link_text = match.group(1)
                    link_url = match.group(2)
                    # Escape quotes in URLs
                    link_url = link_url.replace('"', '&quot;')
                    return f'<link href="{link_url}">{link_text}</link>'
                except Exception:
                    # If anything goes wrong, return the original text
                    return f'[{match.group(1)}]({match.group(2)})'
                
            text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', link_replacer, text)
            
            # Restore our formatting tags
            text = text.replace('&lt;b&gt;', '<b>').replace('&lt;/b&gt;', '</b>')
            text = text.replace('&lt;i&gt;', '<i>').replace('&lt;/i&gt;', '</i>')
            text = text.replace('&lt;u&gt;', '<u>').replace('&lt;/u&gt;', '</u>')
            text = text.replace('&lt;strike&gt;', '<strike>').replace('&lt;/strike&gt;', '</strike>')
            text = text.replace('&lt;font', '<font').replace('&lt;/font&gt;', '</font>')
            text = text.replace('&lt;link', '<link').replace('&lt;/link&gt;', '</link>')
            
            return text
            
        except Exception as e:
            # Ultimate fallback - if anything goes wrong, return plain escaped text
            print(f"Warning: Formatter error in _format_inline_text: {e}")
            return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    
    @staticmethod
    def _extract_headings(content):
        """
        Extract headings from markdown content for table of contents
        with improved error handling and formatting
        """
        if not content:
            return []
            
        headings = []
        lines = content.split('\n')
        
        try:
            for line in lines:
                line = line.strip()
                if line.startswith('#'):
                    level = 0
                    for char in line:
                        if char == '#':
                            level += 1
                        else:
                            break
                    
                    # Validate level (should be 1-6)
                    if level < 1 or level > 6:
                        continue
                    
                    heading_text = line[level:].strip()
                    if heading_text:
                        # Clean up any markdown formatting inside headings for TOC
                        clean_heading = re.sub(r'[*_`]', '', heading_text)  # Remove *, _, and ` chars
                        clean_heading = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', clean_heading)  # Extract link text
                        
                        # Create a valid anchor
                        anchor = heading_text.lower()
                        anchor = re.sub(r'[^\w\s-]', '', anchor)  # Remove special chars
                        anchor = re.sub(r'\s+', '-', anchor)      # Replace spaces with hyphens
                        
                        headings.append({
                            'level': level,
                            'text': clean_heading,
                            'anchor': anchor
                        })
        except Exception as e:
            print(f"Warning: Error extracting headings: {e}")
            # Return what we've collected so far
        
        return headings
    
    @staticmethod
    def _generate_professional_rtf(content, timestamp):
        """
        Generate professional RTF content with proper formatting for Word
        """
        import re
        
        # RTF Header with professional styling
        rtf_header = r"""{\rtf1\ansi\ansicpg1252\deff0\nouicompat\deflang1033
{\fonttbl{\f0\fnil\fcharset0 Calibri;}{\f1\fnil\fcharset0 Consolas;}{\f2\fnil\fcharset0 Arial;}}
{\colortbl ;\red0\green0\blue0;\red30\green64\blue175;\red255\green255\blue255;\red245\green245\blue245;\red128\green128\blue128;\red220\green20\blue60;\red34\green139\blue34;}
{\*\generator CodeDocGen RTF Generator;}
\viewkind4\uc1
\pard\sa200\sl276\slmult1\qc\cf2\f2\fs36\b Code Documentation\b0\par
\pard\sa200\sl276\slmult1\qc\cf5\f0\fs20 Generated on """ + timestamp + r"""\par
\pard\sa200\sl276\slmult1\cf1\f0\fs22\line\line
"""
        
        # Process content line by line
        lines = content.split('\n')
        rtf_body = ""
        in_code_block = False
        in_list = False
        list_level = 0
        
        for line in lines:
            line = line.rstrip()
            
            # Handle code blocks
            if line.startswith('```'):
                if in_code_block:
                    # End code block
                    rtf_body += r"\par}"
                    in_code_block = False
                else:
                    # Start code block
                    language = line[3:].strip() if len(line) > 3 else "code"
                    if language:
                        rtf_body += rf"\pard\sa100\sl240\slmult1\cf6\f0\fs18\b {language.upper()} Code:\b0\par"
                    rtf_body += r"\pard\sa100\sl240\slmult1\cb4\cf1\f1\fs18{"
                    in_code_block = True
                continue
            
            if in_code_block:
                # Code content - escape RTF special characters
                escaped_line = line.replace('\\', '\\\\').replace('{', r'\{').replace('}', r'\}')
                rtf_body += escaped_line + r"\par"
                continue
            
            # Handle headers
            if line.startswith('# '):
                heading_text = line[2:].strip()
                rtf_body += rf"\pard\sa300\sb200\sl360\slmult1\cf2\f2\fs32\b {heading_text}\b0\par"
            elif line.startswith('## '):
                heading_text = line[3:].strip()
                rtf_body += rf"\pard\sa250\sb150\sl300\slmult1\cf2\f2\fs28\b {heading_text}\b0\par"
            elif line.startswith('### '):
                heading_text = line[4:].strip()
                rtf_body += rf"\pard\sa200\sb100\sl276\slmult1\cf2\f0\fs24\b {heading_text}\b0\par"
            elif line.startswith('#### '):
                heading_text = line[5:].strip()
                rtf_body += rf"\pard\sa150\sb80\sl276\slmult1\cf1\f0\fs22\b {heading_text}\b0\par"
            
            # Handle bullet lists
            elif line.startswith('- ') or line.startswith('* ') or line.startswith('+ '):
                if not in_list:
                    in_list = True
                item_text = line[2:].strip()
                item_text = DocumentExporter._format_rtf_inline(item_text)
                rtf_body += rf"\pard\fi-200\li400\sa100\sl276\slmult1\cf1\f0\fs22 \bullet  {item_text}\par"
            
            # Handle numbered lists
            elif re.match(r'^\d+\. ', line):
                if not in_list:
                    in_list = True
                    list_level = 1
                item_text = re.sub(r'^\d+\. ', '', line).strip()
                item_text = DocumentExporter._format_rtf_inline(item_text)
                rtf_body += rf"\pard\fi-200\li400\sa100\sl276\slmult1\cf1\f0\fs22 {list_level}.  {item_text}\par"
                list_level += 1
            
            # Handle blockquotes
            elif line.startswith('>'):
                quote_text = line[1:].strip()
                quote_text = DocumentExporter._format_rtf_inline(quote_text)
                rtf_body += rf"\pard\li400\ri200\sa100\sl276\slmult1\cb4\cf5\f0\fs20\i \ldblquote {quote_text}\rdblquote\i0\par"
            
            # Handle regular paragraphs
            elif line.strip():
                if in_list:
                    rtf_body += r"\pard\sa200\sl276\slmult1"
                    in_list = False
                    list_level = 0
                
                para_text = DocumentExporter._format_rtf_inline(line.strip())
                rtf_body += rf"\pard\sa150\sl276\slmult1\cf1\f0\fs22 {para_text}\par"
            
            # Handle empty lines
            else:
                if in_list:
                    in_list = False
                    list_level = 0
                rtf_body += r"\par"
        
        # Close any open code block
        if in_code_block:
            rtf_body += r"\par}"
        
        # RTF Footer
        rtf_footer = r"""
\pard\sa200\sl276\slmult1\line\line
\pard\sa100\sl276\slmult1\qc\cf5\f0\fs18\i Generated by CodeDocGen - AI-Powered Documentation Generator\i0\par
}"""
        
        return rtf_header + rtf_body + rtf_footer
    
    @staticmethod
    def _format_rtf_inline(text):
        """
        Format inline markdown elements for RTF
        """
        import re
        
        # Handle inline code
        text = re.sub(r'`([^`]+)`', r'\\cf6\\f1\\fs18 \1\\cf1\\f0\\fs22', text)
        
        # Handle bold text
        text = re.sub(r'\*\*(.*?)\*\*', r'\\b \1\\b0', text)
        
        # Handle italic text
        text = re.sub(r'\*(.*?)\*', r'\\i \1\\i0', text)
        
        # Handle links
        text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'\\cf2\\ul \1\\ul0\\cf1', text)
        
        # Escape RTF special characters
        text = text.replace('\\', '\\\\')
        text = text.replace('{', r'\{')
        text = text.replace('}', r'\}')
        
        return text
    
"""
Utilities for exporting documentation in different formats
"""
import uuid
from pathlib import Path
from django.conf import settings
from django.http import FileResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from docx import Document
import markdown2

class DocumentExporter:
    """
    Class for handling document conversion and export in various formats
    """
    
    @staticmethod
    def create_temporary_file(content, format, filename_base="documentation"):
        """
        Creates a temporary file in the specified format
        
        Args:
            content: The markdown content to convert
            format: The format to export (pdf, docx, html, etc)
            filename_base: Base name for the output file
            
        Returns:
            Path to the converted file
        """
        # Create media/temp directory if it doesn't exist
        temp_dir = Path('media/temp')
        temp_dir.mkdir(exist_ok=True, parents=True)
        
        # Generate a unique filename
        unique_id = str(uuid.uuid4())[:8]
        filename = f"{filename_base}_{unique_id}.{format}"
        output_path = temp_dir / filename
        
        if format == 'pdf':
            DocumentExporter.convert_to_pdf(content, output_path)
        elif format == 'docx':
            DocumentExporter.convert_to_docx(content, output_path)
        elif format == 'html':
            DocumentExporter.convert_to_html(content, output_path)
        elif format == 'md':
            # Just write the markdown as is
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(content)
        else:
            # Default to plain text
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
        return output_path
    
    @staticmethod
    def convert_to_pdf(markdown_content, output_path):
        """Convert markdown content to PDF"""
        # Convert markdown to HTML
        html_content = markdown2.markdown(
            markdown_content,
            extras=[
                "fenced-code-blocks",
                "code-friendly",
                "tables",
                "header-ids"
            ]
        )
        
        # Create a PDF document
        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=letter,
            rightMargin=72, 
            leftMargin=72,
            topMargin=72, 
            bottomMargin=72
        )
        
        # Define styles
        styles = getSampleStyleSheet()
        
        # Create the PDF content
        story = []
        
        # Add a title
        story.append(Paragraph("Generated Documentation", styles['Title']))
        story.append(Spacer(1, 12))
        
        # Process the HTML content
        # This is a simple implementation. For complex Markdown-to-PDF, consider using a
        # more sophisticated library like WeasyPrint or pandoc
        for line in html_content.split('<br>'):
            if line.strip():
                # Very basic processing of headers
                if line.startswith('<h1>'):
                    line = line.replace('<h1>', '').replace('</h1>', '')
                    story.append(Paragraph(line, styles['Heading1']))
                elif line.startswith('<h2>'):
                    line = line.replace('<h2>', '').replace('</h2>', '')
                    story.append(Paragraph(line, styles['Heading2']))
                elif line.startswith('<h3>'):
                    line = line.replace('<h3>', '').replace('</h3>', '')
                    story.append(Paragraph(line, styles['Heading3']))
                elif line.startswith('<pre>'):
                    # Code blocks
                    line = line.replace('<pre><code>', '').replace('</code></pre>', '')
                    story.append(Paragraph(line, styles['Code']))
                else:
                    # Regular paragraph
                    if '<code>' in line:
                        # Simple handling for inline code
                        line = line.replace('<code>', '').replace('</code>', '')
                    
                    story.append(Paragraph(line, styles['Normal']))
                
                story.append(Spacer(1, 6))
        
        # Build the PDF
        doc.build(story)
        return output_path

    @staticmethod
    def convert_to_docx(markdown_content, output_path):
        """Convert markdown content to DOCX"""
        # Create a new Document
        doc = Document()
        
        # Add a title
        doc.add_heading('Generated Documentation', level=0)
        
        # Convert markdown to HTML for processing
        html_content = markdown2.markdown(
            markdown_content,
            extras=[
                "fenced-code-blocks",
                "code-friendly",
                "tables",
                "header-ids"
            ]
        )
        
        # Process the HTML content
        for line in html_content.split('<br>'):
            if line.strip():
                # Very basic processing of headers
                if line.startswith('<h1>'):
                    line = line.replace('<h1>', '').replace('</h1>', '')
                    doc.add_heading(line, level=1)
                elif line.startswith('<h2>'):
                    line = line.replace('<h2>', '').replace('</h2>', '')
                    doc.add_heading(line, level=2)
                elif line.startswith('<h3>'):
                    line = line.replace('<h3>', '').replace('</h3>', '')
                    doc.add_heading(line, level=3)
                elif line.startswith('<pre>'):
                    # Code blocks
                    line = line.replace('<pre><code>', '').replace('</code></pre>', '')
                    code_para = doc.add_paragraph(line)
                    code_para.style = 'No Spacing'
                else:
                    # Regular paragraph
                    if '<code>' in line:
                        # Simple handling for inline code
                        line = line.replace('<code>', '').replace('</code>', '')
                    
                    doc.add_paragraph(line)
        
        # Save the Document
        doc.save(str(output_path))
        return output_path

    @staticmethod
    def convert_to_html(markdown_content, output_path):
        """Convert markdown content to HTML"""
        # Convert markdown to HTML
        html_content = markdown2.markdown(
            markdown_content,
            extras=[
                "fenced-code-blocks",
                "code-friendly",
                "tables",
                "header-ids"
            ]
        )
        
        # Create a complete HTML document
        html_document = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Generated Documentation</title>
            <style>
                body {{ 
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
                    line-height: 1.6; 
                    padding: 2rem;
                    max-width: 900px;
                    margin: 0 auto;
                    color: #333;
                }}
                pre {{ 
                    background-color: #f5f5f5; 
                    padding: 1rem; 
                    border-radius: 5px; 
                    overflow-x: auto;
                    border: 1px solid #ddd;
                }}
                code {{ 
                    background-color: #f5f5f5; 
                    padding: 0.2rem 0.4rem; 
                    border-radius: 3px; 
                    font-family: monospace;
                    font-size: 0.9em;
                }}
                h1, h2, h3, h4 {{ color: #333; margin-top: 2rem; }}
                a {{ color: #0366d6; text-decoration: none; }}
                a:hover {{ text-decoration: underline; }}
                table {{ border-collapse: collapse; width: 100%; }}
                th, td {{ padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }}
                tr:hover {{ background-color: #f5f5f5; }}
            </style>
        </head>
        <body>
            <h1>Generated Documentation</h1>
            {html_content}
        </body>
        </html>
        """
        
        # Write the HTML document to a file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_document)
        
        return output_path

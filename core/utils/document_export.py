"""
Document export utilities for CodeDocGen
"""
import os
import tempfile
from typing import Optional


class DocumentExporter:
    """
    Utility class for exporting documentation to different formats
    """
    
    @staticmethod
    def create_temporary_file(content: str, export_format: str) -> str:
        """
        Create a temporary file with the given content in the specified format.
        
        Args:
            content: The markdown content to export
            export_format: The format to export to ('pdf', 'html', 'docx')
            
        Returns:
            str: Path to the created temporary file
        """
        # Create temp directory if it doesn't exist
        temp_dir = os.path.join('media', 'temp')
        os.makedirs(temp_dir, exist_ok=True)
        
        # Generate a temporary filename
        temp_filename = f"export_{int(time.time())}.{export_format}"
        temp_path = os.path.join(temp_dir, temp_filename)
        
        if export_format == 'html':
            # Simple HTML export
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Documentation Export</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        h1, h2, h3 {{ color: #333; }}
        code {{ background: #f4f4f4; padding: 2px 4px; }}
        pre {{ background: #f4f4f4; padding: 10px; overflow-x: auto; }}
    </style>
</head>
<body>
{content}
</body>
</html>
"""
            with open(temp_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
                
        elif export_format == 'pdf':
            # For PDF, we'll just create a text file for now
            # In a full implementation, you'd use libraries like weasyprint or reportlab
            with open(temp_path.replace('.pdf', '.txt'), 'w', encoding='utf-8') as f:
                f.write(f"PDF Export:\n\n{content}")
            temp_path = temp_path.replace('.pdf', '.txt')
            
        elif export_format == 'docx':
            # For DOCX, we'll just create a text file for now
            # In a full implementation, you'd use python-docx library
            with open(temp_path.replace('.docx', '.txt'), 'w', encoding='utf-8') as f:
                f.write(f"DOCX Export:\n\n{content}")
            temp_path = temp_path.replace('.docx', '.txt')
            
        else:
            # Default to text file
            with open(temp_path, 'w', encoding='utf-8') as f:
                f.write(content)
        
        return temp_path


# Import time for timestamp generation
import time

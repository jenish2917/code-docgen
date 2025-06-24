from django.db import models
from django.core.validators import FileExtensionValidator
import os
import uuid

class CodeFile(models.Model):
    """
    Enhanced model for storing uploaded code files with performance optimizations
    
    Features:
    - Database indexing for performance
    - File validation
    - Metadata tracking
    - Language detection
    """
    title = models.CharField(max_length=255, db_index=True)  # Added index for search performance
    file = models.FileField(
        upload_to='code_files',
        validators=[FileExtensionValidator(allowed_extensions=[
            'py', 'js', 'jsx', 'ts', 'tsx', 'java', 'c', 'cpp', 'cs', 'php', 
            'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'r', 'm', 'sh', 'sql', 
            'html', 'css', 'json', 'xml', 'yaml', 'yml', 'md', 'zip'
        ])]
    )
    uploaded_at = models.DateTimeField(auto_now_add=True, db_index=True)  # Added index for date queries
    language = models.CharField(max_length=50, default='python', db_index=True)  # Added index for filtering
    file_size = models.PositiveIntegerField(default=0)  # Track file size for analytics
    
    class Meta:
        ordering = ['-uploaded_at']  # Default ordering by newest first
        indexes = [
            models.Index(fields=['language', 'uploaded_at']),  # Composite index for common queries
            models.Index(fields=['title', 'language']),        # Search by title and language
        ]
    
    def __str__(self):
        return self.title

class Documentation(models.Model):
    """
    Enhanced model for storing generated documentation with performance optimizations
    
    Features:
    - Database indexing for performance
    - Format validation
    - Generation metadata
    """
    code_file = models.ForeignKey(
        CodeFile, 
        on_delete=models.CASCADE, 
        related_name='documentation',
        db_index=True  # Foreign key index for joins
    )
    content = models.TextField()
    file_path = models.CharField(max_length=255)
    generated_at = models.DateTimeField(auto_now_add=True, db_index=True)  # Added index for date queries
    format = models.CharField(
        max_length=10, 
        default='md',
        choices=[
            ('md', 'Markdown'),
            ('html', 'HTML'),
            ('txt', 'Plain Text'),
            ('rtf', 'Rich Text Format'),
            ('pdf', 'PDF')
        ],        db_index=True  # Added index for format filtering
    )
    generation_time = models.FloatField(default=0.0)  # Track generation performance
    owner = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documentations',
        db_index=True  # Index for user-based queries
    )
    
    class Meta:
        ordering = ['-generated_at']  # Default ordering by newest first
        indexes = [
            models.Index(fields=['code_file', 'format']),     # Composite index for file-format queries
            models.Index(fields=['generated_at', 'format']),  # Date-format composite index
            models.Index(fields=['owner', 'generated_at']),   # Index for user's documentation history
        ]
    
    def __str__(self):
        return f"Documentation for {self.code_file.title} ({self.format})"

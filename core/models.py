from django.db import models
import os
import uuid

class CodeFile(models.Model):
    """Model for storing uploaded code files"""
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='code_files')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    language = models.CharField(max_length=50, default='python')
    
    def __str__(self):
        return self.title

class Documentation(models.Model):
    """Model for storing generated documentation"""
    code_file = models.ForeignKey(CodeFile, on_delete=models.CASCADE, related_name='documentation')
    content = models.TextField()
    file_path = models.CharField(max_length=255)
    generated_at = models.DateTimeField(auto_now_add=True)
    format = models.CharField(max_length=10, default='md')
    
    def __str__(self):
        return f"Documentation for {self.code_file.title}"

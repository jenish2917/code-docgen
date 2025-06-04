from django.contrib import admin
from .models import CodeFile, Documentation

# Register your models here.
@admin.register(CodeFile)
class CodeFileAdmin(admin.ModelAdmin):
    list_display = ('title', 'language', 'uploaded_at')
    search_fields = ('title', 'language')
    list_filter = ('language', 'uploaded_at')
    
@admin.register(Documentation)
class DocumentationAdmin(admin.ModelAdmin):
    list_display = ('code_file', 'format', 'generated_at')
    search_fields = ('code_file__title', 'file_path')
    list_filter = ('format', 'generated_at')
    raw_id_fields = ('code_file',)

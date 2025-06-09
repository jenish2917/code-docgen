#!/usr/bin/env python3
"""
Sample Python file for testing CodeDocGen AI documentation generation.
This file demonstrates various Python constructs that should be documented.
"""

import os
import sys
from typing import List, Dict, Optional
import datetime


class DocumentProcessor:
    """
    A class for processing and analyzing documents with AI-powered features.
    """
    
    def __init__(self, config_path: str = "config.json"):
        """
        Initialize the DocumentProcessor with configuration.
        
        Args:
            config_path (str): Path to the configuration file
        """
        self.config_path = config_path
        self.documents = []
        self.processed_count = 0
        
    def load_document(self, file_path: str) -> Optional[Dict]:
        """
        Load a document from the specified file path.
        
        Args:
            file_path (str): Path to the document file
            
        Returns:
            Optional[Dict]: Document data if successful, None otherwise
        """
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
                
            # Simulate document loading
            document = {
                "path": file_path,
                "loaded_at": datetime.datetime.now(),
                "content": f"Mock content for {file_path}",
                "metadata": {
                    "size": os.path.getsize(file_path) if os.path.exists(file_path) else 0,
                    "format": file_path.split('.')[-1] if '.' in file_path else "unknown"
                }
            }
            
            self.documents.append(document)
            return document
            
        except Exception as e:
            print(f"Error loading document {file_path}: {e}")
            return None
    
    def process_batch(self, file_paths: List[str]) -> Dict[str, int]:
        """
        Process multiple documents in batch.
        
        Args:
            file_paths (List[str]): List of file paths to process
            
        Returns:
            Dict[str, int]: Processing statistics
        """
        stats = {"success": 0, "failed": 0, "total": len(file_paths)}
        
        for file_path in file_paths:
            result = self.load_document(file_path)
            if result:
                stats["success"] += 1
                self.processed_count += 1
            else:
                stats["failed"] += 1
                
        return stats
    
    def get_summary(self) -> str:
        """
        Get a summary of processed documents.
        
        Returns:
            str: Summary information
        """
        return f"Processed {self.processed_count} documents, {len(self.documents)} currently loaded."


def validate_file_paths(paths: List[str]) -> List[str]:
    """
    Validate a list of file paths and return only existing ones.
    
    Args:
        paths (List[str]): List of file paths to validate
        
    Returns:
        List[str]: List of valid file paths
    """
    valid_paths = []
    for path in paths:
        if os.path.exists(path) and os.path.isfile(path):
            valid_paths.append(path)
        else:
            print(f"Warning: Invalid file path: {path}")
    
    return valid_paths


def main():
    """
    Main function to demonstrate the DocumentProcessor usage.
    """
    # Initialize processor
    processor = DocumentProcessor()
    
    # Sample file paths (some may not exist)
    sample_paths = [
        "document1.txt",
        "document2.pdf", 
        "nonexistent.doc",
        __file__  # This file itself
    ]
    
    # Validate paths
    valid_paths = validate_file_paths(sample_paths)
    print(f"Found {len(valid_paths)} valid files out of {len(sample_paths)}")
    
    # Process documents
    if valid_paths:
        stats = processor.process_batch(valid_paths)
        print(f"Processing complete: {stats}")
        print(processor.get_summary())
    else:
        print("No valid files to process")


if __name__ == "__main__":
    main()

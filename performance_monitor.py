#!/usr/bin/env python3
"""
Performance Monitoring Script for Code Documentation Generator

This script provides comprehensive performance analysis for both single file
and project-level documentation generation. It includes benchmarking,
response time analysis, and quality metrics.

Features:
- Response time measurement (target: <2s for single files, <30s for projects)
- Memory usage monitoring
- Documentation quality assessment
- Cache hit rate analysis
- Database query optimization tracking

Usage:
    python performance_monitor.py --test-file path/to/test.py
    python performance_monitor.py --test-project path/to/project.zip
    python performance_monitor.py --benchmark-all

Author: Code Documentation Generator Team
Date: June 2025
Version: 2.0.0
"""

import os
import sys
import time
import psutil
import statistics
import requests
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class PerformanceMetrics:
    """
    Data class for storing performance metrics
    
    Attributes:
        response_time (float): Response time in seconds
        memory_usage (float): Memory usage in MB
        cpu_usage (float): CPU usage percentage
        cache_hit (bool): Whether cache was used
        doc_quality_score (float): Documentation quality score (1-10)
        file_size (int): Input file size in bytes
        generated_doc_size (int): Generated documentation size in bytes
    """
    response_time: float
    memory_usage: float
    cpu_usage: float
    cache_hit: bool
    doc_quality_score: float
    file_size: int
    generated_doc_size: int

class PerformanceMonitor:
    """
    Performance monitoring and benchmarking for documentation generation
    
    This class provides comprehensive performance analysis including:
    - Response time benchmarking
    - Memory and CPU usage tracking
    - Documentation quality assessment
    - Cache performance analysis
    """
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        """
        Initialize the performance monitor
        
        Args:
            base_url (str): Base URL of the Django API server
        """
        self.base_url = base_url
        self.metrics_history: List[PerformanceMetrics] = []
        
    def measure_single_file_performance(self, file_path: str) -> PerformanceMetrics:
        """
        Measure performance for single file documentation generation
        
        Args:
            file_path (str): Path to the test file
            
        Returns:
            PerformanceMetrics: Comprehensive performance data
            
        Raises:
            FileNotFoundError: If test file doesn't exist
            requests.RequestException: If API request fails
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Test file not found: {file_path}")
            
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Start monitoring
        process = psutil.Process()
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        start_time = time.time()
        start_cpu = process.cpu_percent()
        
        try:
            # Upload file to API
            with open(file_path, 'rb') as f:
                files = {'file': f}
                response = requests.post(f"{self.base_url}/api/upload", files=files)
                
            response_time = time.time() - start_time
            
            # Get final resource usage
            final_memory = process.memory_info().rss / 1024 / 1024  # MB
            memory_usage = final_memory - initial_memory
            cpu_usage = process.cpu_percent() - start_cpu
            
            # Parse response
            response_data = response.json()
            cache_hit = response_data.get('cache_hit', False)
            documentation = response_data.get('documentation', '')
            generated_doc_size = len(documentation.encode('utf-8'))
            
            # Calculate documentation quality score
            doc_quality_score = self._assess_documentation_quality(documentation, file_path)
            
            metrics = PerformanceMetrics(
                response_time=response_time,
                memory_usage=memory_usage,
                cpu_usage=cpu_usage,
                cache_hit=cache_hit,
                doc_quality_score=doc_quality_score,
                file_size=file_size,
                generated_doc_size=generated_doc_size
            )
            
            self.metrics_history.append(metrics)
            return metrics
            
        except requests.RequestException as e:
            raise requests.RequestException(f"API request failed: {str(e)}")
    
    def _assess_documentation_quality(self, documentation: str, file_path: str) -> float:
        """
        Assess documentation quality based on completeness and accuracy
        
        Args:
            documentation (str): Generated documentation
            file_path (str): Original file path for context
            
        Returns:
            float: Quality score from 1.0 to 10.0
        """
        score = 5.0  # Base score
        
        # Check for key documentation elements
        doc_lower = documentation.lower()
        
        # Function documentation
        if 'def ' in documentation or 'function' in doc_lower:
            if 'args:' in doc_lower or 'parameters:' in doc_lower:
                score += 1.0
            if 'returns:' in doc_lower or 'return:' in doc_lower:
                score += 1.0
            if 'raises:' in doc_lower or 'throws:' in doc_lower:
                score += 0.5
                
        # Class documentation
        if 'class ' in documentation:
            if 'attributes:' in doc_lower or 'properties:' in doc_lower:
                score += 1.0
            if 'methods:' in doc_lower:
                score += 0.5
                
        # General quality indicators
        if len(documentation) > 500:  # Substantial documentation
            score += 1.0
        if '```' in documentation:  # Code examples
            score += 1.0
        if any(word in doc_lower for word in ['example', 'usage', 'note', 'warning']):
            score += 1.0
            
        return min(score, 10.0)
    
    def benchmark_response_times(self, test_files: List[str], iterations: int = 5) -> Dict:
        """
        Benchmark response times across multiple files and iterations
        
        Args:
            test_files (List[str]): List of test file paths
            iterations (int): Number of iterations per file
            
        Returns:
            Dict: Comprehensive benchmark results
        """
        results = {
            'individual_results': [],
            'summary': {
                'avg_response_time': 0.0,
                'median_response_time': 0.0,
                'min_response_time': float('inf'),
                'max_response_time': 0.0,
                'cache_hit_rate': 0.0,
                'avg_quality_score': 0.0
            }
        }
        
        all_response_times = []
        cache_hits = 0
        total_tests = 0
        quality_scores = []
        
        for file_path in test_files:
            file_results = []
            
            for i in range(iterations):
                print(f"Testing {file_path} - Iteration {i+1}/{iterations}")
                
                try:
                    metrics = self.measure_single_file_performance(file_path)
                    file_results.append(metrics)
                    all_response_times.append(metrics.response_time)
                    quality_scores.append(metrics.doc_quality_score)
                    
                    if metrics.cache_hit:
                        cache_hits += 1
                    total_tests += 1
                    
                except Exception as e:
                    print(f"Error testing {file_path}: {str(e)}")
                    continue
                    
                # Brief pause between iterations
                time.sleep(1)
                
            results['individual_results'].append({
                'file': file_path,
                'metrics': file_results
            })
        
        # Calculate summary statistics
        if all_response_times:
            results['summary']['avg_response_time'] = statistics.mean(all_response_times)
            results['summary']['median_response_time'] = statistics.median(all_response_times)
            results['summary']['min_response_time'] = min(all_response_times)
            results['summary']['max_response_time'] = max(all_response_times)
            
        if total_tests > 0:
            results['summary']['cache_hit_rate'] = cache_hits / total_tests
            
        if quality_scores:
            results['summary']['avg_quality_score'] = statistics.mean(quality_scores)
            
        return results
    
    def generate_performance_report(self, output_path: str = "performance_report.md") -> None:
        """
        Generate a comprehensive performance report
        
        Args:
            output_path (str): Path to save the report
        """
        if not self.metrics_history:
            print("No performance data available. Run benchmarks first.")
            return
            
        report = []
        report.append("# Code Documentation Generator - Performance Report")
        report.append(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # Summary statistics
        response_times = [m.response_time for m in self.metrics_history]
        quality_scores = [m.doc_quality_score for m in self.metrics_history]
        
        report.append("## Performance Summary")
        report.append(f"- **Total Tests**: {len(self.metrics_history)}")
        report.append(f"- **Average Response Time**: {statistics.mean(response_times):.2f}s")
        report.append(f"- **Median Response Time**: {statistics.median(response_times):.2f}s")
        report.append(f"- **95th Percentile**: {sorted(response_times)[int(len(response_times) * 0.95)]:.2f}s")
        report.append(f"- **Average Quality Score**: {statistics.mean(quality_scores):.1f}/10")
        report.append("")
        
        # Performance targets
        report.append("## Performance Targets vs Actual")
        target_single_file = 2.0  # 2 seconds target
        passing_tests = sum(1 for rt in response_times if rt <= target_single_file)
        report.append(f"- **Target for Single Files**: ≤{target_single_file}s")
        report.append(f"- **Tests Meeting Target**: {passing_tests}/{len(response_times)} ({passing_tests/len(response_times)*100:.1f}%)")
        report.append("")
        
        # Recommendations
        report.append("## Recommendations")
        avg_time = statistics.mean(response_times)
        if avg_time > target_single_file:
            report.append("⚠️ **Performance Issues Detected:**")
            report.append("- Average response time exceeds target")
            report.append("- Consider implementing more aggressive caching")
            report.append("- Optimize AI model response times")
        else:
            report.append("✅ **Performance is within acceptable ranges**")
            
        avg_quality = statistics.mean(quality_scores)
        if avg_quality < 7.0:
            report.append("📝 **Documentation Quality Issues:**")
            report.append("- Average quality score is below target (7.0)")
            report.append("- Review documentation templates")
            report.append("- Enhance AI prompts for better output")
        else:
            report.append("✅ **Documentation quality is good**")
            
        # Write report
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(report))
            
        print(f"📊 Performance report saved to: {output_path}")

def main():
    """Main function for command-line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Performance monitoring for Code Documentation Generator")
    parser.add_argument("--test-file", help="Single file to test")
    parser.add_argument("--benchmark-all", action="store_true", help="Run comprehensive benchmark")
    parser.add_argument("--iterations", type=int, default=3, help="Number of iterations per test")
    parser.add_argument("--output", default="performance_report.md", help="Output report file")
    
    args = parser.parse_args()
    
    monitor = PerformanceMonitor()
    
    if args.test_file:
        print(f"Testing single file: {args.test_file}")
        try:
            metrics = monitor.measure_single_file_performance(args.test_file)
            print(f"Response time: {metrics.response_time:.2f}s")
            print(f"Memory usage: {metrics.memory_usage:.2f}MB")
            print(f"Quality score: {metrics.doc_quality_score:.1f}/10")
            print(f"Cache hit: {metrics.cache_hit}")
        except Exception as e:
            print(f"Error: {str(e)}")
            
    elif args.benchmark_all:
        # Find test files in the project
        test_files = []
        for ext in ['.py', '.js', '.java', '.cpp']:
            test_files.extend(list(Path('.').glob(f'**/*{ext}')))
            
        if not test_files:
            print("No test files found. Creating sample test files...")
            # Could create sample files here
            return
            
        test_files = [str(f) for f in test_files[:5]]  # Limit to 5 files for demo
        print(f"Running benchmark on {len(test_files)} files with {args.iterations} iterations each")
        
        results = monitor.benchmark_response_times(test_files, args.iterations)
        monitor.generate_performance_report(args.output)
        
        print("\n📊 Benchmark Results:")
        print(f"Average response time: {results['summary']['avg_response_time']:.2f}s")
        print(f"Cache hit rate: {results['summary']['cache_hit_rate']:.1%}")
        print(f"Average quality score: {results['summary']['avg_quality_score']:.1f}/10")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()

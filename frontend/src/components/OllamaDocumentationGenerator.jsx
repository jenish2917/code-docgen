// Enhanced React component for Ollama AI documentation generation
// frontend/src/components/OllamaDocumentationGenerator.jsx

import React, { useState, useRef } from 'react';
import ApiService from '../services/api';

const OllamaDocumentationGenerator = () => {
  const [code, setCode] = useState('');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('qwen:0.5b');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [documentation, setDocumentation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const textareaRef = useRef(null);

  // Available models (you can expand this based on your Ollama setup)
  const availableModels = [
    { value: 'qwen:0.5b', label: 'Qwen 0.5B (Fast)' },
    { value: 'qwen:1.8b', label: 'Qwen 1.8B (Balanced)' },
    { value: 'llama3:8b', label: 'Llama 3 8B (High Quality)' },
    { value: 'codellama:7b', label: 'Code Llama 7B (Code Specialist)' },
    { value: 'phi3:mini', label: 'Phi-3 Mini (Efficient)' },
  ];

  // Predefined prompts for different documentation types
  const promptTemplates = [
    {
      name: 'General Code Documentation',
      template: 'Analyze this code and provide comprehensive documentation including purpose, parameters, return values, and usage examples:'
    },
    {
      name: 'API Documentation',
      template: 'Generate API documentation for this code including endpoints, request/response formats, and error handling:'
    },
    {
      name: 'Function Documentation',
      template: 'Create detailed function documentation with docstrings, parameter descriptions, and examples:'
    },
    {
      name: 'Class Documentation',
      template: 'Generate class documentation including attributes, methods, inheritance, and usage patterns:'
    },
    {
      name: 'Security Review',
      template: 'Analyze this code for security vulnerabilities and provide recommendations:'
    },
    {
      name: 'Performance Analysis',
      template: 'Review this code for performance issues and suggest optimizations:'
    },
  ];

  const handleGenerate = async () => {
    if (!code.trim() && !prompt.trim()) {
      setError('Please provide either code to analyze or a custom prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setDocumentation('');
    setMetadata(null);

    try {
      const fullPrompt = code.trim() 
        ? `${prompt || 'Analyze and document this code:'}\n\n\`\`\`\n${code}\n\`\`\``
        : prompt;

      const response = await ApiService.generateDocumentationWithOllama(fullPrompt, {
        model,
        temperature,
        maxTokens,
      });

      if (response.success) {
        setDocumentation(response.documentation);
        setMetadata(response.metadata);
      } else {
        setError(`Generation failed: ${response.error}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    setCode('');
    setPrompt('');
    setDocumentation('');
    setError(null);
    setMetadata(null);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(documentation);
      alert('Documentation copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleExport = async (format) => {
    if (!documentation) return;

    try {
      setLoading(true);
      const response = await ApiService.exportDocs(
        documentation,
        `ollama_documentation_${Date.now()}`,
        format
      );

      if (response.download_url) {
        const link = document.createElement('a');
        link.href = response.download_url;
        link.download = response.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      setError(`Export failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ollama-documentation-generator p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
        🤖 AI Documentation Generator (Ollama)
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Input Configuration</h3>
          
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">AI Model:</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {availableModels.map((modelOption) => (
                <option key={modelOption.value} value={modelOption.value}>
                  {modelOption.label}
                </option>
              ))}
            </select>
          </div>

          {/* Prompt Template Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Prompt Template:</label>
            <select
              onChange={(e) => {
                const template = promptTemplates.find(t => t.template === e.target.value);
                if (template) setPrompt(template.template);
              }}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a template...</option>
              {promptTemplates.map((template, index) => (
                <option key={index} value={template.template}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Prompt */}
          <div>
            <label className="block text-sm font-medium mb-2">Custom Prompt:</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your documentation request..."
              className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Code Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Code to Analyze:</label>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full p-3 border rounded-lg h-64 font-mono text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Temperature: {temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                Lower = more focused, Higher = more creative
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Tokens:</label>
              <input
                type="number"
                min="100"
                max="4000"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🤖 Generating...' : '✨ Generate Documentation'}
            </button>
            <button
              onClick={handleClearAll}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Generated Documentation</h3>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">❌ {error}</p>
            </div>
          )}

          {/* Metadata Display */}
          {metadata && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Generation Info:</h4>
              <div className="text-sm text-blue-600">
                <p>Model: {metadata.model}</p>
                <p>Tokens: {metadata.evalCount}</p>
                <p>Duration: {(metadata.totalDuration / 1000000).toFixed(2)}ms</p>
              </div>
            </div>
          )}

          {/* Documentation Output */}
          <div className="relative">
            <textarea
              value={documentation}
              readOnly
              placeholder="Generated documentation will appear here..."
              className="w-full p-4 border rounded-lg h-96 font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500"
            />
            
            {documentation && (
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={handleCopyToClipboard}
                  className="bg-white border rounded px-3 py-1 text-sm hover:bg-gray-50"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
            )}
          </div>

          {/* Export Options */}
          {documentation && (
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm font-medium">Export as:</span>
              {['pdf', 'html', 'md', 'txt', 'docx'].map((format) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OllamaDocumentationGenerator;

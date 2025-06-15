import React, { useState, useEffect } from 'react';
import './ProcessingIndicator.css';

const ProcessingIndicator = ({ 
  isProcessing, 
  mode = 'balanced', 
  fileName = '', 
  onCancel = null,
  progress = 0 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Processing steps based on mode
  const steps = {
    speed: [
      "🔍 Analyzing code structure",
      "⚡ Generating documentation instantly"
    ],
    balanced: [
      "🔍 Analyzing code structure",
      "🧠 Understanding code logic", 
      "📝 Crafting documentation",
      "✨ Adding final touches"
    ],
    quality: [
      "🔍 Deep code analysis",
      "🧠 Understanding patterns",
      "📊 Analyzing dependencies",
      "📝 Generating comprehensive docs",
      "🎨 Formatting and styling",
      "✨ Quality review"
    ]
  };

  const currentSteps = steps[mode] || steps.balanced;
  
  // Expected time ranges
  const timeRanges = {
    speed: "< 1 second",
    balanced: "10-15 seconds", 
    quality: "30-60 seconds"
  };

  // Animate dots
  useEffect(() => {
    if (!isProcessing) return;
    
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(dotInterval);
  }, [isProcessing]);

  // Timer
  useEffect(() => {
    if (!isProcessing) {
      setTimeElapsed(0);
      setCurrentStep(0);
      return;
    }
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isProcessing]);

  // Step progression
  useEffect(() => {
    if (!isProcessing) return;

    const stepDuration = mode === 'speed' ? 500 : 
                        mode === 'balanced' ? 3000 : 8000;
    
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        return next >= currentSteps.length ? prev : next;
      });
    }, stepDuration);

    return () => clearInterval(stepInterval);
  }, [isProcessing, mode, currentSteps.length]);

  if (!isProcessing) return null;

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const progressPercentage = currentStep === 0 ? 10 : 
                           ((currentStep + 1) / currentSteps.length) * 100;

  return (
    <div className="processing-overlay">
      <div className="processing-modal">
        {/* Header */}
        <div className="processing-header">
          <div className="processing-icon">
            <div className="brain-animation">
              <div className="brain-pulse"></div>
              🧠
            </div>
          </div>
          <h3>Creating Amazing Documentation</h3>
          <p className="processing-subtitle">
            Transforming your code into beautiful docs{dots}
          </p>
        </div>

        {/* File info */}
        {fileName && (
          <div className="processing-file">
            📄 <span className="file-name">{fileName}</span>
          </div>
        )}

        {/* Mode indicator */}
        <div className="processing-mode">
          <span className={`mode-badge mode-${mode}`}>
            {mode === 'speed' && '⚡ Lightning Fast'}
            {mode === 'balanced' && '🎯 Smart & Fast'}
            {mode === 'quality' && '💎 Premium Quality'}
          </span>
          <span className="time-estimate">
            Expected: {timeRanges[mode]}
          </span>
        </div>

        {/* Progress bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {Math.round(progressPercentage)}% Complete
          </div>
        </div>

        {/* Current step */}
        <div className="current-step">
          <div className="step-icon">
            {currentSteps[currentStep]?.split(' ')[0]}
          </div>
          <div className="step-text">
            {currentSteps[currentStep]?.substring(2) || 'Processing...'}
          </div>
        </div>

        {/* Step indicators */}
        <div className="step-indicators">
          {currentSteps.map((step, index) => (
            <div 
              key={index}
              className={`step-dot ${index <= currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
            >
              {index < currentStep ? '✓' : ''}
            </div>
          ))}
        </div>

        {/* Time and cancel */}
        <div className="processing-footer">
          <div className="time-elapsed">
            Time: {formatTime(timeElapsed)}
          </div>
          {onCancel && (
            <button 
              className="cancel-button"
              onClick={onCancel}
              title="Cancel processing"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Fun facts or tips */}
        <div className="processing-tip">
          💡 {mode === 'speed' ? 'Lightning mode analyzes code structure for instant docs' :
               mode === 'balanced' ? 'Smart mode balances speed with AI-powered insights' :
               'Premium mode provides comprehensive analysis and documentation'}
        </div>
      </div>
    </div>
  );
};

export default ProcessingIndicator;

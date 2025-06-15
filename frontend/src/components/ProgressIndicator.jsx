import React, { useState, useEffect } from 'react';

const ProgressIndicator = ({ isVisible, fileName, estimatedTime = 30 }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const steps = [
    { title: "Reading your code", icon: "📖", duration: 15 },
    { title: "Understanding structure", icon: "🧠", duration: 25 },
    { title: "Crafting documentation", icon: "✍️", duration: 35 },
    { title: "Polishing content", icon: "✨", duration: 25 }
  ];

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setCurrentStep(0);
      setTimeElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
      
      // Calculate progress based on estimated time
      const newProgress = Math.min((timeElapsed / estimatedTime) * 100, 95);
      setProgress(newProgress);
      
      // Update current step based on progress
      if (newProgress < 25) setCurrentStep(0);
      else if (newProgress < 50) setCurrentStep(1);
      else if (newProgress < 75) setCurrentStep(2);
      else setCurrentStep(3);
      
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, timeElapsed, estimatedTime]);

  if (!isVisible) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl text-white">📚</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Generating Documentation
          </h3>
          <p className="text-gray-600 text-sm">
            Processing: <span className="font-medium">{fileName}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-6">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex items-center p-3 rounded-lg transition-all duration-500 ${
                index === currentStep 
                  ? 'bg-blue-50 border-l-4 border-blue-500 transform scale-105' 
                  : index < currentStep 
                    ? 'bg-green-50 border-l-4 border-green-500' 
                    : 'bg-gray-50 border-l-4 border-gray-300'
              }`}
            >
              <span className={`text-2xl mr-3 ${
                index === currentStep ? 'animate-bounce' : ''
              }`}>
                {index < currentStep ? '✅' : step.icon}
              </span>
              <span className={`font-medium ${
                index === currentStep 
                  ? 'text-blue-700' 
                  : index < currentStep 
                    ? 'text-green-700' 
                    : 'text-gray-600'
              }`}>
                {step.title}
              </span>
              {index === currentStep && (
                <div className="ml-auto flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Time and Tips */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Time elapsed:</span>
            <span className="font-mono text-sm font-medium text-gray-800">
              {formatTime(timeElapsed)}
            </span>
          </div>
          
          <div className="text-xs text-gray-500 leading-relaxed">
            💡 <strong>Tip:</strong> We're analyzing your code structure and generating comprehensive documentation with examples and best practices.
          </div>
        </div>

        {/* Floating particles animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-blue-400 rounded-full opacity-20 animate-ping`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;

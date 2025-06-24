/**
 * Logger Utility
 * 
 * A central logging utility that can be toggled off in production mode.
 * This allows for easy management of logging throughout the application.
 */

// Set to false to disable all logging in production
const isLoggingEnabled = process.env.NODE_ENV !== 'production';

// Create a logger object with methods that mirror the console
const logger = {
  log: (...args) => {
    if (isLoggingEnabled) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    if (isLoggingEnabled) {
      console.error(...args);
    }
    
    // If you want to implement error tracking in production:
    // if (process.env.NODE_ENV === 'production') {
    //   // Capture error for monitoring tool like Sentry
    //   // captureException(args);
    // }
  },
  
  info: (...args) => {
    if (isLoggingEnabled) {
      console.info(...args);
    }
  },
  
  warn: (...args) => {
    if (isLoggingEnabled) {
      console.warn(...args);
    }
  },
  
  debug: (...args) => {
    if (isLoggingEnabled && process.env.DEBUG) {
      console.debug(...args);
    }
  },
  
  // Special method for API logging
  api: (method, url, status) => {
    if (isLoggingEnabled) {
      console.log(`API ${method} ${url} - ${status || 'PENDING'}`);
    }
  }
};

export default logger;

import React from 'react';
import ReactMarkdown from 'react-markdown';
import CodeHighlighter from './CodeHighlighter';

const SampleDocumentation = () => {
  // Sample markdown documentation content
  const sampleMarkdown = `
# User Authentication Module

## Overview
This module handles all user authentication processes including registration, login, password recovery, and two-factor authentication. It implements JWT (JSON Web Token) for secure authentication and follows industry best practices for password storage and security.

## Functions

### register(username, email, password)
Registers a new user in the system with email verification.

\`\`\`python
def register(username, email, password):
    """
    Register a new user with email, username and password
    
    Parameters:
    - username (str): The unique username for the user
    - email (str): The email address of the user
    - password (str): The password, which will be hashed before storage
    
    Returns:
    - dict: User data and confirmation message
    
    Raises:
    - ValueError: If username or email already exists
    """
    # Validate inputs
    if User.objects.filter(email=email).exists():
        raise ValueError(f"Email '{email}' already exists")
    
    if User.objects.filter(username=username).exists():
        raise ValueError(f"Username '{username}' already exists")
        
    # Create user
    user = User.objects.create_user(
        username=username, 
        password=password, 
        email=email
    )
    
    # Create an empty profile for the user
    UserProfile.objects.create(user=user)
    
    # Send verification email
    send_verification_email(user)
    
    return {
        'message': 'User registered successfully',
        'user_id': user.id
    }
\`\`\`

### login(username_or_email, password)
Authenticates a user and issues JWT tokens for subsequent requests.

## Security Measures
- Passwords are hashed using Argon2 algorithm
- Rate limiting to prevent brute force attacks
- Token rotation and expiration policies
- IP-based suspicious activity detection

## Dependencies
- Django Authentication Framework
- djangorestframework-simplejwt
- pyotp (for 2FA)
`;

  // Custom renderers for markdown with improved styling and hierarchy
  const components = {
    h1: ({children}) => (
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
        {children}
      </h1>
    ),
    h2: ({children}) => (
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4 text-blue-600 dark:text-blue-400">
        {children}
      </h2>
    ),
    h3: ({children}) => (
      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mt-6 mb-3">
        {children}
      </h3>
    ),
    p: ({children}) => (
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {children}
      </p>
    ),
    ul: ({children}) => (
      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">
        {children}
      </ul>
    ),
    li: ({children}) => (
      <li className="ml-4">{children}</li>
    ),
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="my-4">
          <CodeHighlighter 
            language={match[1]} 
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </CodeHighlighter>
        </div>
      ) : (
        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-red-600 dark:text-red-400" {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Sample Documentation</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
            🤖 AI Generated
          </span>
        </div>
      </div>
      <div className="documentation-content bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700
                     text-gray-900 dark:text-gray-100 leading-relaxed max-w-none">
        <ReactMarkdown components={components}>{sampleMarkdown}</ReactMarkdown>
      </div>
    </div>
  );
};

export default SampleDocumentation;

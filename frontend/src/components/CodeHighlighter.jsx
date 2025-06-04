import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-bash';
import 'prismjs/themes/prism-tomorrow.css';

const CodeHighlighter = ({ language, children }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [children]);
  return (
    <pre className={`language-${language || 'python'} rounded-lg bg-gray-800 dark:bg-gray-900 p-4 overflow-auto my-4`}>
      <code className={`language-${language || 'python'} text-sm`}>{children}</code>
    </pre>
  );
};

export default CodeHighlighter;

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
    <pre className={`language-${language || 'python'}`}>
      <code className={`language-${language || 'python'}`}>{children}</code>
    </pre>
  );
};

export default CodeHighlighter;

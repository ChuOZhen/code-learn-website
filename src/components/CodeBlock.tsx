'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    hljs?: {
      highlightElement: (el: HTMLElement) => void;
    };
  }
}

export default function CodeBlock({ code, language = 'cpp' }: { code: string; language?: string }) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current && window.hljs) {
      window.hljs.highlightElement(codeRef.current);
    }
  }, [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group rounded-lg overflow-hidden my-4 border border-border shadow-md">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-code-header border-b border-border">
        <span className="text-xs text-foreground-muted font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-foreground-muted hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-white/10"
        >
          {copied ? '已复制!' : '复制'}
        </button>
      </div>
      <pre className="bg-code-bg overflow-x-auto whitespace-pre !mt-0 !mb-0 !rounded-none">
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
}

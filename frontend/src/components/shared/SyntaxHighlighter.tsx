import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language: 'solidity' | 'typescript' | 'bash' | 'javascript';
  title: string;
}

export const CodeBlock = ({ code, language, title }: CodeBlockProps) => {
  return (
    <div className="rounded-lg overflow-hidden">
      <div className="bg-slate-800 px-4 py-2 text-xs text-slate-300 uppercase tracking-wide border-b border-slate-700">
        {title}
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

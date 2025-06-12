"use client";

import { useRef, useEffect, useState } from "react";
import { ChatMessage, MessagePart, FileUpload } from "@/types";
import { User, Bot, Loader2, Copy, Check, Download, Eye, File, Image as ImageIcon } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageWindowProps {
  history: ChatMessage[];
  isLoading?: boolean;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const CodeBlock = ({ inline, className, children, ...props }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  
  const handleCopy = async () => {
    if (typeof children === 'string') {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (inline) {
    return (
      <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-lg">
        <span className="text-sm font-medium">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
};

const FilePreview = ({ file }: { file: FileUpload }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isImage = file.type.startsWith('image/');
  
  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = `data:${file.type};base64,${file.data}`;
    link.download = file.name;
    link.click();
  };

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 mb-3 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isImage ? (
            <ImageIcon size={16} className="text-blue-500" />
          ) : (
            <File size={16} className="text-gray-500" />
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {file.name}
          </span>
          <span className="text-xs text-gray-500">
            ({Math.round(file.size / 1024)} KB)
          </span>
        </div>
        <div className="flex gap-1">
          {isImage && file.preview && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="Preview image"
            >
              <Eye size={14} />
            </button>
          )}
          <button
            onClick={downloadFile}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Download file"
          >
            <Download size={14} />
          </button>
        </div>
      </div>
      
      {isExpanded && isImage && file.preview && (
        <div className="mt-3">
          <img 
            src={file.preview} 
            alt={file.name}
            className="max-w-full h-auto rounded border"
          />
        </div>
      )}
    </div>
  );
};

const MessageContent = ({ parts, files }: { parts: MessagePart[], files?: FileUpload[] }) => {
  return (
    <div className="space-y-2">
      {/* File attachments */}
      {files && files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <FilePreview key={file.id} file={file} />
          ))}
        </div>
      )}
      
      {/* Text content */}
      <div className="space-y-2">
        {parts.map((part, idx) => {
          if ('text' in part) {
            return (
              <div key={idx} className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    code: CodeBlock,
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="">{children}</li>,
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold mb-1">{children}</h3>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 dark:border-gray-600">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 bg-gray-100 dark:bg-gray-700 font-semibold">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">{children}</td>
                    ),
                  }}
                >
                  {part.text}
                </ReactMarkdown>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default function MessageWindow({ history, isLoading }: MessageWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isLoading]);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };
  
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {history.map((msg, index) => {
          const isUser = msg.role === "user";
          
          return (
            <div
              key={msg.id || index}
              className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"} animate-slide-up`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center shadow-md
                  ${isUser 
                    ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                    : "bg-gradient-to-br from-purple-500 to-pink-500"
                  }
                `}>
                  {isUser ? (
                    <User size={20} className="text-white" />
                  ) : (
                    <Bot size={20} className="text-white" />
                  )}
                </div>
              </div>
              
              {/* Message content */}
              <div className={`flex-1 min-w-0 ${isUser ? "text-right" : "text-left"}`}>
                {/* Message header */}
                <div className={`flex items-center gap-2 mb-2 ${isUser ? "justify-end" : "justify-start"}`}>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isUser ? "You" : "AI Assistant"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                
                {/* Message bubble */}
                <div className={`
                  inline-block max-w-full rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md
                  ${isUser 
                    ? "bg-blue-600 text-white rounded-br-md" 
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md"
                  }
                `}>
                  <div className="px-4 py-3">
                    <MessageContent 
                      parts={msg.parts} 
                      files={msg.files}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-4 animate-slide-up">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <Bot size={20} className="text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  AI Assistant
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(new Date())}
                </span>
              </div>
              
              <div className="inline-block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

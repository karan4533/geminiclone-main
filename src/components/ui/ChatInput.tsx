"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Settings, Send, X, Loader2, Paperclip, Image, File, Plus, Trash2 } from "lucide-react";
import { FileUpload } from "@/types";

interface ChatInputProps {
  onSend: (message: string, files?: FileUpload[]) => void;
  onOpenSettings: () => void;
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ...SUPPORTED_IMAGE_TYPES
];

export default function ChatInput({ onSend, onOpenSettings, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  const processFile = useCallback(async (file: File): Promise<FileUpload | null> => {
    console.log('Processing file:', { name: file.name, type: file.type, size: file.size });
    
    if (file.size > MAX_FILE_SIZE) {
      alert(`File ${file.name} is too large. Maximum size is 10MB.`);
      return null;
    }

    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      alert(`File type ${file.type} is not supported. Supported types: Images (JPEG, PNG, GIF, WebP), PDF, and Text files.`);
      return null;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          
          if (!result || !result.includes(',')) {
            console.error('Invalid file data format');
            alert(`Failed to process ${file.name}. Please try again.`);
            resolve(null);
            return;
          }
          
          const base64Data = result.split(',')[1];
          
          if (!base64Data || base64Data.length === 0) {
            console.error('Empty file data');
            alert(`File ${file.name} appears to be empty. Please try a different file.`);
            resolve(null);
            return;
          }
          
          const fileUpload: FileUpload = {
            id: `${Date.now()}-${Math.random()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64Data,
            preview: SUPPORTED_IMAGE_TYPES.includes(file.type) ? result : undefined
          };
          
          console.log('File processed successfully:', { name: file.name, dataLength: base64Data.length });
          resolve(fileUpload);
        } catch (error) {
          console.error('Error processing file:', error);
          alert(`Failed to process ${file.name}. Please try again.`);
          resolve(null);
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        alert(`Failed to read ${file.name}. Please try again.`);
        resolve(null);
      };
      
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    const fileArray = Array.from(selectedFiles);
    const processedFiles = await Promise.all(
      fileArray.map(file => processFile(file))
    );
    
    const validFiles = processedFiles.filter(Boolean) as FileUpload[];
    setFiles(prev => [...prev, ...validFiles]);
    setShowAttachMenu(false);
  }, [processFile]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      await handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleSend = () => {
    if ((message.trim() || files.length > 0) && !isLoading) {
      onSend(message.trim(), files.length > 0 ? files : undefined);
      setMessage("");
      setFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const clearAll = () => {
    setMessage("");
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      <div className="max-w-4xl mx-auto px-4 pb-4">
        {/* File previews */}
        {files.length > 0 && (
          <div className="mb-3 p-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {files.length} file{files.length > 1 ? 's' : ''} attached
              </span>
              <button
                onClick={clearAll}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 size={12} />
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {files.map((file) => (
                <div key={file.id} className="relative group">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    {file.preview ? (
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <File size={16} className="text-gray-500" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-32">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="ml-1 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main input container */}
        <div 
          className={
            "relative transition-all duration-200 " +
            (isDragOver ? "scale-[1.02] " : "") +
            "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg " +
            "border-2 border-dashed " +
            (isDragOver 
              ? "border-blue-400 bg-blue-50/50 dark:bg-blue-950/20" 
              : "border-transparent") +
            " rounded-2xl"
          }
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className={
            "flex items-end gap-3 p-4 " +
            "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg " +
            "border border-gray-200 dark:border-gray-700 " +
            "rounded-2xl shadow-lg " +
            "transition-all duration-200 " +
            "focus-within:shadow-xl focus-within:border-blue-500 dark:focus-within:border-blue-400"
          }>
            {/* Textarea wrapper */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                className={
                  "w-full px-3 py-3 bg-transparent border-none resize-none " +
                  "focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 " +
                  "text-gray-900 dark:text-gray-100 text-base leading-relaxed " +
                  "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                }
                placeholder={files.length > 0 ? "Add a message to your files..." : "Message AI..."}
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                rows={1}
                style={{ minHeight: '24px', maxHeight: '200px' }}
              />

              {/* Clear button */}
              {(message || files.length > 0) && (
                <button
                  className={
                    "absolute right-2 top-3 p-1 rounded-full " +
                    "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 " +
                    "hover:bg-gray-100 dark:hover:bg-gray-700 " +
                    "transition-colors"
                  }
                  onClick={handleClear}
                  aria-label="Clear input"
                  disabled={isLoading}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Attachment menu */}
              <div className="relative">
                <button
                  className={
                    "p-2.5 rounded-full transition-all " +
                    "text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 " +
                    "hover:bg-gray-100 dark:hover:bg-gray-700 " +
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 " +
                    "dark:focus:ring-offset-gray-900"
                  }
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  aria-label="Attach files"
                  disabled={isLoading}
                >
                  <Paperclip size={20} />
                </button>

                {showAttachMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2 min-w-36">
                    <button
                      onClick={() => {
                        imageInputRef.current?.click();
                        setShowAttachMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
                    >
                      <Image size={16} />
                      Images
                    </button>
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAttachMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
                    >
                      <File size={16} />
                      Files
                    </button>
                  </div>
                )}
              </div>

              {/* Settings button */}
              <button
                className={
                  "p-2.5 rounded-full transition-all " +
                  "text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 " +
                  "hover:bg-gray-100 dark:hover:bg-gray-700 " +
                  "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 " +
                  "dark:focus:ring-offset-gray-900"
                }
                onClick={onOpenSettings}
                aria-label="Open settings"
                disabled={isLoading}
              >
                <Settings size={20} />
              </button>

              {/* Send button */}
              <button
                className={
                  "p-2.5 rounded-full transition-all transform " +
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 " +
                  "dark:focus:ring-offset-gray-900 " +
                  ((message.trim() || files.length > 0) && !isLoading
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white " +
                      "hover:from-blue-700 hover:to-blue-800 " +
                      "shadow-lg hover:shadow-xl active:scale-95"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 " +
                      "cursor-not-allowed")
                }
                onClick={handleSend}
                disabled={!(message.trim() || files.length > 0) || isLoading}
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Drag overlay */}
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 rounded-2xl pointer-events-none">
              <div className="text-center">
                <Plus className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-blue-600 font-medium">Drop files here</p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept={SUPPORTED_IMAGE_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_FILE_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import ChatInput from "@/components/ui/ChatInput";
import MessageWindow from "@/components/ui/MessageWindow";
import SettingsModal from "@/components/ui/SettingsModal";
import ThemeToggle from "@/components/ui/ThemeToggle";
import WelcomeScreen from "@/components/ui/WelcomeScreen";
import { ChatMessage, ChatSettings, MessageRole, FileUpload, MessagePart } from "@/types";
import { Zap } from "lucide-react";

export default function Home() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    temperature: 0.7,
    model: "gemini-1.5-flash",
    systemInstruction: "You are a helpful AI assistant. Provide accurate, detailed, and informative responses. When analyzing images or files, be thorough and precise in your descriptions.",
  });

  const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleSend = async (message: string, files?: FileUpload[]) => {
    // Create message parts
    const parts: MessagePart[] = [];
    
    if (message.trim()) {
      parts.push({ text: message });
    }
    
    // Add file parts if present
    if (files && files.length > 0) {
      files.forEach(file => {
        parts.push({
          inlineData: {
            mimeType: file.type,
            data: file.data
          }
        });
      });
    }

    const newUserMessage: ChatMessage = {
      id: generateMessageId(),
      role: "user" as MessageRole,
      parts: parts,
      files: files,
      timestamp: new Date(),
    };

    const updatedHistory = [...history, newUserMessage];
    setHistory(updatedHistory);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: message,
          history: updatedHistory,
          settings: settings,
          files: files,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("AI Error:", data.error);
        
        // Add a user-friendly error message to chat
        const errorMessage: ChatMessage = {
          id: generateMessageId(),
          role: "model" as MessageRole,
          parts: [{ 
            text: getErrorMessage(data.error, response.status)
          }],
          timestamp: new Date(),
        };
        setHistory([...updatedHistory, errorMessage]);
        return;
      }

      const aiMessage: ChatMessage = {
        id: generateMessageId(),
        role: "model" as MessageRole,
        parts: [{ text: data.response }],
        timestamp: new Date(),
      };

      setHistory([...updatedHistory, aiMessage]);
    } catch (error) {
      console.error("Request Failed:", error);
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: "model" as MessageRole,
        parts: [{ text: "❌ Connection error. Please check your internet connection and try again." }],
        timestamp: new Date(),
      };
      setHistory([...updatedHistory, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: string, status: number): string => {
    if (status === 429 || error.includes("quota") || error.includes("rate limit")) {
      return "⚠️ Rate limit exceeded. Please try again in a few minutes or switch to a different model in settings.";
    }
    
    if (status === 401 || error.includes("unauthorized") || error.includes("API key")) {
      return "🔑 Invalid API key. Please check your configuration in settings.";
    }
    
    if (status === 400 || error.includes("invalid")) {
      return "⚠️ Invalid request. Please try a different input or check your files.";
    }
    
    return `❌ Error: ${error}`;
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleSaveSettings = (newSettings: ChatSettings) => {
    setSettings(newSettings);
  };

  const handleClearChat = () => {
    setHistory([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Assistant
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Online • Enhanced with vision
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {history.length > 0 && (
              <button
                onClick={handleClearChat}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-gray-600"
              >
                New Chat
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-20 pb-32">
        {history.length === 0 ? (
          <WelcomeScreen onSend={(msg) => handleSend(msg)} />
        ) : (
          <MessageWindow history={history} isLoading={isLoading} />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onSave={handleSaveSettings}
        currentSettings={settings}
      />
      
      {/* Chat Input */}
      <ChatInput 
        onSend={handleSend} 
        onOpenSettings={handleOpenSettings}
        isLoading={isLoading}
      />
    </div>
  );
}

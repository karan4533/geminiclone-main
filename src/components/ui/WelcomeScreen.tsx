"use client";

import { MessageCircle, Lightbulb, Code, HelpCircle } from 'lucide-react';

interface WelcomeScreenProps {
  onSend: (message: string) => void;
}

const suggestedPrompts = [
  {
    icon: MessageCircle,
    title: "Creative Writing",
    prompt: "Help me write a compelling story about AI and humanity",
    description: "Creative content and storytelling",
    gradient: "from-orange-400 to-red-500"
  },
  {
    icon: Code,
    title: "Code Analysis",
    prompt: "Review this code and suggest improvements",
    description: "Programming help and debugging",
    gradient: "from-green-400 to-blue-500"
  },
  {
    icon: Lightbulb,
    title: "Image Analysis",
    prompt: "Upload an image and I'll analyze it in detail",
    description: "Vision and image understanding",
    gradient: "from-yellow-400 to-orange-500"
  },
  {
    icon: HelpCircle,
    title: "Document Review",
    prompt: "Upload a PDF or document for analysis",
    description: "File analysis and summarization",
    gradient: "from-purple-400 to-pink-500"
  }
];

export default function WelcomeScreen({ onSend }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center mb-12 animate-fade-in">
        <div className="mb-6">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI Assistant
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-xl mb-4 max-w-lg">
          Enhanced with vision • File analysis • Code generation
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm max-w-md">
          Upload images, documents, or simply chat. I can analyze, explain, and help with almost anything.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {suggestedPrompts.map((prompt, index) => {
          const Icon = prompt.icon;
          return (
            <button
              key={index}
              onClick={() => onSend(prompt.prompt)}
              className={
                "group relative p-6 text-left rounded-2xl border border-gray-200/50 dark:border-gray-700/50 " +
                "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm " +
                "hover:bg-white dark:hover:bg-gray-800 " +
                "transition-all duration-300 hover:shadow-xl hover:scale-[1.05] " +
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 " +
                "dark:focus:ring-offset-gray-900 animate-slide-up " +
                "hover:border-gray-300 dark:hover:border-gray-600"
              }
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>
              <div className="relative">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 bg-gradient-to-br ${prompt.gradient} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg">
                      {prompt.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                      {prompt.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 italic bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                      &ldquo;{prompt.prompt}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Text Chat</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Image Analysis</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>File Processing</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Start by typing a message, uploading files, or try one of the suggestions above
        </p>
      </div>
    </div>
  );
}


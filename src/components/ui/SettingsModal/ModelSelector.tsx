//geminiclone/src/components/ui/SettingsModal/ModelSelector.tsx
import { Bot } from "lucide-react";
import { useState } from "react";

interface ModelOption {
    id: string;
    name: string;
  }

interface ModelSelectorProps {
    model: string;
    onChange: (modelId: string) => void;
  }
  
  const MODEL_OPTIONS: ModelOption[] = [
    { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash (Experimental)" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
    { id: "gemini-1.5-flash-latest", name: "Gemini 1.5 Flash (Latest)" },
    { id: "gemini-1.5-flash-8b", name: "Gemini 1.5 Flash 8B" }
  ];
  
  export default function ModelSelector({ model, onChange }: ModelSelectorProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Bot size={16} className="text-purple-500 dark:text-purple-400" />
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Model</label>
        </div>
        <div className="relative">
          <button 
            type="button" 
            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-left flex justify-between items-center text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span>{MODEL_OPTIONS.find(m => m.id === model)?.name || model}</span>
            <span className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {dropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {MODEL_OPTIONS.map((option) => (
                <button 
                  key={option.id} 
                  className={`w-full p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100
                            ${model === option.id ? 'bg-purple-50 dark:bg-purple-900/30 border-l-2 border-purple-500 dark:border-purple-400' : ''}`}
                  onClick={() => { onChange(option.id); setDropdownOpen(false); }}
                >
                  {option.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
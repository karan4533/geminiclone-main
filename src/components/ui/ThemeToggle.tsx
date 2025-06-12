"use client";

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  const handleClick = () => {
    console.log('Theme toggle clicked, current theme:', theme);
    toggleTheme();
  };

  // Show a placeholder during hydration
  if (!mounted) {
    return (
      <div className="p-2 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600" />
    );
  }

  return (
    <button
      onClick={handleClick}
      className={
        "relative p-2 rounded-full transition-all duration-300 ease-in-out " +
        "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 " +
        "border border-gray-200 dark:border-gray-600 " +
        "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 " +
        "dark:focus:ring-offset-gray-800 group"
      }
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={
            "absolute inset-0 transition-all duration-300 text-amber-500 " +
            (theme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-75'
            )
          }
          size={20}
        />
        <Moon 
          className={
            "absolute inset-0 transition-all duration-300 text-blue-400 " +
            (theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-75'
            )
          }
          size={20}
        />
      </div>
    </button>
  );
}


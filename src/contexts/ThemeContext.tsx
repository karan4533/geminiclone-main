"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
  // Force remove both classes first
  root.classList.remove('light');
  root.classList.remove('dark');
  
  // Add the new theme class
  root.classList.add(theme);
  
  // Also set it as data attribute for debugging
  root.setAttribute('data-theme', theme);
  
  console.log('Theme applied:', theme, 'HTML classes:', root.className);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = () => {
      let initialTheme: Theme = 'light';
      
      try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
          initialTheme = savedTheme;
        } else {
          // Check system preference
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            initialTheme = 'dark';
          }
        }
      } catch (error) {
        console.log('Error reading theme from localStorage:', error);
      }
      
      setTheme(initialTheme);
      applyTheme(initialTheme);
      setMounted(true);
    };

    initializeTheme();
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (mounted) {
      applyTheme(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Toggling theme from', theme, 'to', newTheme);
    setTheme(newTheme);
  };

  const value = {
    theme,
    toggleTheme,
    setTheme,
    mounted,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}


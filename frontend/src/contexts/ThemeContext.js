import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
    // Check localStorage for saved preference
      if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem("darkMode");
        if (saved !== null && saved !== undefined && saved !== 'undefined') {
          const parsed = JSON.parse(saved);
          if (typeof parsed === 'boolean') {
            return parsed;
          }
    }
        // Check system preference - safely handle test environment
        if (window.matchMedia && typeof window.matchMedia === 'function') {
          const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
          if (mediaQuery && typeof mediaQuery.matches === 'boolean') {
            return mediaQuery.matches;
          }
        }
      }
    } catch (error) {
      // Silently handle any errors in test environment
      console.warn('Theme detection failed:', error);
    }
    // Default to light mode if anything fails
    return false;
  });

  useEffect(() => {
    try {
      // Only run in browser environment
      if (typeof window === 'undefined' || !window.localStorage) return;
      
    // Save preference to localStorage
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));

    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      }
    } catch (error) {
      // Silently handle any errors in test environment
      console.warn('Theme application failed:', error);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

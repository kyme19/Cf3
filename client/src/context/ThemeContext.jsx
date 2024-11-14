import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        
        // Store preference
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    useEffect(() => {
        // Load saved preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
        }
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    // Theme colors
    const theme = {
        dark: {
            // Base colors
            primary: '#1c1c24',
            secondary: '#2c2f32',
            text: '#ffffff',
            subtext: '#808191',
            accent: '#1dc071',
            background: '#13131a',
            card: '#1c1c24',
            border: '#3a3a43',
            
            // Additional colors
            'accent-secondary': '#8c6dfd',
            'accent-light': '#1dc071/10',
            'accent-hover': '#19a660',
            'error': '#ff3333',
            'success': '#1dc071',
            'warning': '#ff8a00',
            
            // Gradients
            'gradient-1': 'linear-gradient(to right, #8c6dfd, #8c6dfd80)',
            'gradient-2': 'linear-gradient(to right, #1dc071, #1dc07180)',
            
            // Overlays
            'overlay-dark': 'rgba(13, 13, 26, 0.7)',
            'overlay-light': 'rgba(255, 255, 255, 0.1)',
            
            // Shadows
            'shadow-card': '0px 4px 6px rgba(0, 0, 0, 0.1)',
            'shadow-button': '0px 2px 4px rgba(0, 0, 0, 0.1)'
        },
        light: {
            // Base colors
            primary: '#ffffff',
            secondary: '#f2f2f2',
            text: '#1c1c24',
            subtext: '#4b5264',
            accent: '#1dc071',
            background: '#fafafa',
            card: '#ffffff',
            border: '#e0e0e0',
            
            // Additional colors
            'accent-secondary': '#8c6dfd',
            'accent-light': '#1dc071/10',
            'accent-hover': '#19a660',
            'error': '#dc2626',
            'success': '#059669',
            'warning': '#d97706',
            
            // Gradients
            'gradient-1': 'linear-gradient(to right, #8c6dfd, #8c6dfd80)',
            'gradient-2': 'linear-gradient(to right, #1dc071, #1dc07180)',
            
            // Overlays
            'overlay-dark': 'rgba(0, 0, 0, 0.1)',
            'overlay-light': 'rgba(255, 255, 255, 0.7)',
            
            // Shadows
            'shadow-card': '0px 4px 6px rgba(0, 0, 0, 0.05)',
            'shadow-button': '0px 2px 4px rgba(0, 0, 0, 0.05)'
        }
    };

    useEffect(() => {
        const root = document.documentElement;
        const currentTheme = isDarkMode ? theme.dark : theme.light;

        // Set CSS variables
        Object.entries(currentTheme).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });

        // Set additional CSS variables for specific use cases
        root.style.setProperty('--input-background', isDarkMode ? '#1c1c24' : '#ffffff');
        root.style.setProperty('--input-text', isDarkMode ? '#ffffff' : '#1c1c24');
        root.style.setProperty('--input-placeholder', isDarkMode ? '#808191' : '#4b5264');
        root.style.setProperty('--hover-opacity', '0.9');
        root.style.setProperty('--transition-duration', '0.3s');
    }, [isDarkMode]);

    return (
        <ThemeContext.Provider value={{ 
            isDarkMode, 
            toggleTheme, 
            theme: isDarkMode ? theme.dark : theme.light,
            colors: theme // Expose all colors for direct access if needed
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
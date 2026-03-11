import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // darkMode = true means DARK mode is active (default)
    // darkMode = false means LIGHT mode is active
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved !== null ? JSON.parse(saved) : true;
    });

    // Apply theme on mount and when darkMode changes
    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;
        
        if (darkMode) {
            // Dark mode active - remove .dark class to show default dark styles
            root.classList.remove('dark');
            body.classList.remove('dark');
        } else {
            // Light mode active - add .dark class to show light styles
            root.classList.add('dark');
            body.classList.add('dark');
        }
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};


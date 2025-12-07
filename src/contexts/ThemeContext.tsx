"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface Theme {
    primaryColor: string;
    tenantName: string;
}

interface ThemeContextType {
    theme: Theme;
    loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>({
        primaryColor: "#EA580C",
        tenantName: "Restaurant"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/theme")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTheme(data.theme);

                    // Apply CSS variables dynamically
                    document.documentElement.style.setProperty('--color-primary', data.theme.primaryColor);
                }
            })
            .catch(err => console.error("Failed to load theme:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, loading }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

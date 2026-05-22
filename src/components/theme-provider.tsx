"use client"

import * as React from "react"
type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  [key: string]: unknown;
};

// This is a simplified version of next-themes's provider logic.
// In a real app, you would `npm install next-themes` and `import { ThemeProvider } from "next-themes"`.
// We are re-creating it here to avoid modifying package.json as per instructions.

const ThemeContext = React.createContext<
  | {
      theme: string
      setTheme: (theme: string) => void
    }
  | undefined
>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("dark")
    root.classList.add("light")
  }, [])

  const value = React.useMemo(() => ({
    theme: "light",
    setTheme: () => {},
  }), [])

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

import { createContext, useContext, useEffect, useState } from "react"

const ThemeProviderContext = createContext({ theme: "dark", setTheme: () => null })

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "horizon-ui-theme",
}) {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem(storageKey)
    return storedTheme || defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  const value = {
    theme,
    setTheme: (newTheme) => {
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
} 
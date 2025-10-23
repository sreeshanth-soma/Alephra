"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
    
    // Only add theme transition class after a short delay to prevent flashing on initial load
    const timer = setTimeout(() => {
      document.documentElement.classList.add('theme-transition')
    }, 100)
    
    // Listen for system theme changes (only if system theme is enabled)
    if (props.enableSystem) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        // Re-apply transitions smoothly on system theme change
        document.documentElement.classList.remove('theme-transition')
        setTimeout(() => {
          document.documentElement.classList.add('theme-transition')
        }, 10)
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => {
        clearTimeout(timer)
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
    
    return () => clearTimeout(timer)
  }, [props.enableSystem])

  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

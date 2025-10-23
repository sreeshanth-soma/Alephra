"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"

/**
 * Hook to manage per-page theme preferences
 * Stores theme preference in localStorage per route
 */
export function usePageTheme() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    // Load saved theme for this page
    const savedTheme = localStorage.getItem(`theme-${pathname}`)
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme)
    }
  }, [pathname, theme, setTheme])

  const setPageTheme = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem(`theme-${pathname}`, newTheme)
  }

  return { theme, setPageTheme }
}

"use client"

import { Home, FileText, LayoutDashboard, Mic } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const navItems = [
  {
    href: "/",
    icon: Home,
    label: "Home"
  },
  {
    href: "/analysis",
    icon: FileText,
    label: "Analysis"
  },
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard"
  },
  {
    href: "/voice",
    icon: Mic,
    label: "Voice"
  }
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-20 md:hidden" />
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 md:hidden backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90">
        <div className="flex justify-around items-center h-16 px-2 relative">
          {navItems.map((item) => {
            // Fix active state detection for home page
            const isActive = item.href === "/" 
              ? pathname === "/" 
              : pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full relative",
                  "touch-manipulation select-none",
                  "active:scale-95 transition-transform duration-150"
                )}
              >
                {/* Active indicator - moved outside motion.div for better positioning */}
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-black dark:bg-white rounded-full"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
                
                <motion.div
                  className="flex flex-col items-center justify-center"
                  whileTap={{ scale: 0.9 }}
                >
                  <div className={cn(
                    "p-2 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-black dark:bg-white text-white dark:text-black" 
                      : "text-gray-600 dark:text-gray-400"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn(
                    "text-xs mt-1 font-medium transition-colors duration-200",
                    isActive 
                      ? "text-black dark:text-white" 
                      : "text-gray-600 dark:text-gray-400"
                  )}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

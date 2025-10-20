"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, BarChart3, LayoutDashboard, Mic, User, LogOut, LogIn } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import { HoverBorderGradient } from "./ui/hover-border-gradient";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== "loading";

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
    closeMenu();
  };

  const navItems = [
    {
      name: 'Home',
      href: '/',
      description: 'Landing page',
      gradient: 'from-gray-800 to-black'
    },
    {
      name: 'Analysis',
      href: '/analysis',
      description: 'AI report analysis',
      gradient: 'from-gray-800 to-black'
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      description: 'Health overview',
      gradient: 'from-gray-800 to-black'
    },
    {
      name: 'Voice Agent',
      href: '/voice',
      description: 'AI voice assistant',
      gradient: 'from-gray-800 to-black'
    }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg shadow-black/5 dark:shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group" onClick={closeMenu}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center shadow-lg shadow-black/25 dark:shadow-white/25 group-hover:shadow-black/40 dark:group-hover:shadow-white/40 transition-all duration-300 group-hover:scale-105">
                <svg 
                  className="w-6 h-6 text-white dark:text-black" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                >
                  {/* Heartbeat line */}
                  <path d="M3 12h3l2-4 4 8 2-4h3" />
                  {/* Medical cross overlay */}
                  <path d="M17 8v8M21 12h-8" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Alephra
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">AI Healthcare</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative group"
                >
                  {isActive ? (
                    <div className="relative px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-gray-900 via-black to-gray-900 dark:from-white dark:via-gray-100 dark:to-white text-white dark:text-black shadow-lg shadow-black/30 dark:shadow-white/20 transition-all duration-300">
                      {item.name}
                    </div>
                  ) : (
                    <div className="relative px-5 py-2.5 rounded-xl font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white hover:shadow-md transition-all duration-300">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
            <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 flex items-center space-x-3">
              <div className="relative">
                <ThemeToggle className="relative" />
              </div>
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-800 to-black flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:block">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Link href="/signin" className="relative group">
                  <div className="px-5 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center space-x-2 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md">
                    <LogIn className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Sign In</span>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle className="relative" />
            <button
              onClick={toggleMenu}
              className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 shadow-lg"
              aria-label="Toggle menu"
            >
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isOpen ? <X className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
              </motion.div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 shadow-xl"
          >
            <div className="px-6 py-8 space-y-3">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -30, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
                  >
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className="block group relative"
                    >
                      {isActive ? (
                        <div className="relative px-4 py-4 rounded-2xl bg-gradient-to-r from-gray-900 via-black to-gray-900 dark:from-white dark:via-gray-100 dark:to-white shadow-lg shadow-black/30 dark:shadow-white/20 transition-all duration-300">
                          <div className="flex-1">
                            <div className="font-bold text-lg text-white dark:text-black tracking-wide">
                              {item.name}
                            </div>
                            <div className="text-sm text-white/90 dark:text-black/80">
                              {item.description}
                            </div>
                          </div>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-700 via-black to-gray-700 dark:from-gray-300 dark:via-white dark:to-gray-300 opacity-20 blur-xl"></div>
                        </div>
                      ) : (
                        <div className="relative px-4 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 group-hover:shadow-md transition-all duration-300">
                          <div className="flex-1">
                            <div className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-gray-800 to-black flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-900 dark:text-white">
                          {user.name || 'User'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Link href="/signin" onClick={closeMenu} className="block">
                    <div className="w-full h-12 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md">
                      <LogIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-base">Sign In with Google</span>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

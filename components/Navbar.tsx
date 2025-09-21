"use client";

import React, { useState } from 'react';
import Link from 'next/link';
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
      gradient: 'from-blue-800 to-black'
    },
    {
      name: 'Analysis',
      href: '/analysis',
      description: 'AI report analysis',
      gradient: 'from-blue-800 to-black'
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      description: 'Health overview',
      gradient: 'from-blue-800 to-black'
    },
    {
      name: 'Voice Agent',
      href: '/voice',
      description: 'AI voice assistant',
      gradient: 'from-blue-800 to-black'
    }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg shadow-black/5 dark:shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group" onClick={closeMenu}>
            <div className="relative">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/25 group-hover:shadow-black/40 transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              {/* <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-black rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div> */}
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                MedScan
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">AI Healthcare</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <HoverBorderGradient
                  key={item.name}
                  containerClassName="rounded-full"
                  as={Link}
                  href={item.href}
                  className={`dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 ${
                    isActive ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                  duration={0.5}
                  clockwise={false}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold transition-colors duration-300 ${
                      isActive 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                    }`}>
                      {item.name}
                    </span>
                  </div>
                </HoverBorderGradient>
              );
            })}
            <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 flex items-center space-x-3">
              <ThemeToggle className="relative" />
              {session ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:block">
                    {session.user?.name?.split(' ')[0]}
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
                <Link href="/signin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
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
                    <HoverBorderGradient
                      containerClassName="rounded-2xl"
                      as={Link}
                      href={item.href}
                      onClick={closeMenu}
                      className={`dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 px-3 py-2 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-lg ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700' 
                          : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700'
                      }`}
                      duration={0.5}
                      clockwise={false}
                    >
                      <div className="flex-1">
                        <div className={`font-bold text-lg transition-colors duration-300 ${
                          isActive 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200'
                        }`}>
                          {item.name}
                        </div>
                        <div className={`text-sm transition-colors duration-300 ${
                          isActive 
                            ? 'text-blue-500 dark:text-blue-300' 
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                    </HoverBorderGradient>
                  </motion.div>
                );
              })}
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {session ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-900 dark:text-white">
                          {session.user?.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {session.user?.email}
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
                  <Link href="/signin" onClick={closeMenu}>
                    <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In with Google
                    </Button>
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

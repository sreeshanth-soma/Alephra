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
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-lg shadow-black/10 dark:shadow-white/25 group-hover:shadow-black/20 dark:group-hover:shadow-white/40 transition-all duration-300 group-hover:scale-105">
                <Image 
                  src="/logo.jpg" 
                  alt="Alephra Logo" 
                  width={32} 
                  height={32} 
                  className="object-contain rounded-lg"
                />
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

          {/* Mobile theme toggle only (bottom nav handles navigation) */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle className="relative" />
            {/* User profile on mobile */}
            {user && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-800 to-black flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            )}
            {!user && (
              <Link href="/signin" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation removed - using bottom nav bar instead */}
    </nav>
  );
};

export default Navbar;

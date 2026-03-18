'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, Menu, X, User, LogOut, Ticket, MapPin } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  // Simple auth check (in production, use the zustand store)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-btn group-hover:scale-105 transition-transform">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white">
              Bus<span className="text-gradient">Book</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/search">Search</NavLink>
            <NavLink href="/bookings">My Bookings</NavLink>
            <NavLink href="/track">Track Bus</NavLink>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">
              Login
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800/50 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-900/95 backdrop-blur-xl border-b border-white/[0.06]"
          >
            <div className="px-4 py-4 space-y-1">
              <MobileNavLink href="/" onClick={() => setIsOpen(false)}>Home</MobileNavLink>
              <MobileNavLink href="/search" onClick={() => setIsOpen(false)}>Search Buses</MobileNavLink>
              <MobileNavLink href="/bookings" onClick={() => setIsOpen(false)}>My Bookings</MobileNavLink>
              <MobileNavLink href="/track" onClick={() => setIsOpen(false)}>Track Bus</MobileNavLink>
              <hr className="border-dark-700/50 my-3" />
              <div className="flex gap-3 pt-2">
                <Link href="/login" className="btn-secondary text-sm py-2 px-4 flex-1 text-center" onClick={() => setIsOpen(false)}>Login</Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4 flex-1 text-center" onClick={() => setIsOpen(false)}>Sign Up</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-sm text-dark-300 hover:text-white rounded-lg hover:bg-dark-800/50 transition-all duration-200 font-medium"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-3 text-dark-200 hover:text-white hover:bg-dark-800/50 rounded-xl transition-all"
    >
      {children}
    </Link>
  );
}

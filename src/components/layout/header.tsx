'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Articles', href: '/articles' },
  { label: 'Service', href: '/services' },
  { label: 'About us', href: '/about' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 ${
        scrolled
          ? 'bg-[#F7F3E8]/95 backdrop-blur-md shadow-xs border-b border-[#3A4F1C]/10'
          : 'bg-[#F7F3E8]/80 backdrop-blur-xs border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-nowrap gap-4">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="group flex items-center gap-3 shrink-0 transition-opacity duration-200 hover:opacity-90"
        >
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <Icon size={70} priority className="max-w-none" />
            </div>
          </div>
          <span className="text-lg sm:text-xl font-serif font-bold tracking-wider text-[#3A4F1C] uppercase">
            Casamento Events
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-8 shrink-0">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs lg:text-sm tracking-wider lg:tracking-widest uppercase transition-colors duration-200 whitespace-nowrap ${
                  isActive
                    ? 'text-[#3A4F1C] font-semibold underline underline-offset-8 decoration-[#BC6F07] decoration-2'
                    : 'text-[#3A4F1C]/80 hover:text-[#3A4F1C] hover:decoration-[#BC6F07]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:block shrink-0">
          <Button href="/book-now" size="sm" variant="primary">
            Book now
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-[#3A4F1C] hover:bg-[#EFEAD8] focus:outline-none focus:ring-2 focus:ring-[#BC6F07]"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-full bg-[#F7F3E8] border-b border-[#3A4F1C]/15 shadow-xl transition-all duration-300">
          <nav className="px-6 py-8 flex flex-col space-y-6 text-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base tracking-widest uppercase py-1 ${
                    isActive
                      ? 'text-[#3A4F1C] font-bold text-[#BC6F07]'
                      : 'text-[#3A4F1C]/80 hover:text-[#3A4F1C]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-[#3A4F1C]/10">
              <Button href="/book-now" size="md" variant="primary" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                Book now
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#3A4F1C] text-[#F7F3E8] border-t border-[#BC6F07]/30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand & Statement Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-serif font-bold tracking-wider text-[#F7F3E8] uppercase">
                Casamento Events
              </span>
            </Link>
            <p className="text-sm text-[#F7F3E8]/80 leading-relaxed font-light max-w-md">
              Crafting unforgettable celebrations that last a lifetime. From intimate weddings to grand corporate galas, we bring bespoke elegance and seamless execution to every occasion.
            </p>
            <div className="pt-2">
              <span className="inline-block w-8 h-0.5 bg-[#BC6F07]" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold tracking-widest text-[#BC6F07] uppercase">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-[#BC6F07] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-[#BC6F07] transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-[#BC6F07] transition-colors">
                  Articles & Vlogs
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#BC6F07] transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#BC6F07] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/book-now" className="hover:text-[#BC6F07] transition-colors">
                  Book Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Operations */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold tracking-widest text-[#BC6F07] uppercase">
              Legal & Operating
            </h3>
            <ul className="space-y-2.5 text-sm text-[#F7F3E8]/80">
              <li>Casamento Events Management Inc.</li>
              <li>Metro Manila & Destination Events</li>
              <li>
                <a href="mailto:contact@casamentoevents.com" className="hover:text-[#BC6F07] transition-colors">
                  contact@casamentoevents.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-16 pt-8 border-t border-[#F7F3E8]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F7F3E8]/60">
          <p>© {currentYear} Casamento Events Management. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-[#F7F3E8] cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-[#F7F3E8] cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-[#F7F3E8] cursor-pointer">Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

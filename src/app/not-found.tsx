import React from 'react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F3E8] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <span className="text-xs font-semibold tracking-widest text-[#BC6F07] uppercase">
          404 — Page Not Found
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif text-[#3A4F1C]">
          An Elegant Detour
        </h1>
        <div className="w-12 h-0.5 bg-[#BC6F07] mx-auto" />
        <p className="text-base text-[#3A4F1C]/80 font-light leading-relaxed">
          The page you are looking for may have been moved, renamed, or is currently being curated for our upcoming phase.
        </p>
        <div className="pt-4">
          <Button href="/" size="lg" variant="primary">
            Return to Home Page
          </Button>
        </div>
      </div>
    </div>
  );
}

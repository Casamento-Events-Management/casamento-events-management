'use client';

import React, { useState, useEffect } from 'react';

interface CookieSection {
  id: string;
  title: string;
}

const SECTIONS: CookieSection[] = [
  { id: 'overview', title: 'Overview' },
  { id: 'essential-security-cookies', title: 'Essential Security Cookies' },
  { id: 'advertising-tracking', title: 'Advertising & Commercial Tracking' },
  { id: 'managing-cookies', title: 'Managing Cookies in Your Browser' },
  { id: 'inquiries', title: 'Inquiries' },
];

export function CookiesContent() {
  const [activeSection, setActiveSection] = useState<string>('overview');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="relative">
      {/* ── MAIN CONTENT CONTAINER WITH DESKTOP SIDEBAR ── */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start">
        {/* DESKTOP LEFT SIDEBAR TAB PANEL (hidden on iPad/mobile, visible only on lg+) */}
        <aside className="hidden lg:block lg:w-72 shrink-0 sticky top-16 lg:top-20 pt-4 pb-6 px-4 self-start">
          <div className="border-r border-[#3A4F1C]/20 pr-4 space-y-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#BC6F07] font-semibold">
                Table of Contents
              </p>
              <h2 className="text-base font-serif font-bold text-[#2A3A14] mt-0.5">
                Cookie Settings
              </h2>
              <p className="text-[11px] text-[#2A3A14]/70 mt-0.5 font-mono">
                Effective: October 2026
              </p>
            </div>

            <nav aria-label="Cookie sections" className="space-y-0.5">
              {SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => handleScrollTo(sec.id)}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'text-[#2A3A14] font-semibold'
                        : 'text-[#2A3A14]/65 hover:text-[#2A3A14]'
                    }`}
                  >
                    <span>{sec.title}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#BC6F07] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-[#3A4F1C]/15 text-[11px] text-[#2A3A14]/70 space-y-1.5">
              <p>
                Questions regarding our cookie or site security practices?
              </p>
              <a
                href="mailto:hello@casamentoevents.com"
                className="text-[#BC6F07] hover:underline font-medium block"
              >
                hello@casamentoevents.com
              </a>
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT COLUMN: ALTERNATING SECTIONS WITHOUT NUMBERING */}
        <div className="flex-1 w-full overflow-hidden">
          {/* SECTION 1: OVERVIEW */}
          <section
            id="overview"
            className="min-h-[45vh] sm:min-h-[50vh] py-16 sm:py-20 px-6 sm:px-12 lg:px-16 bg-[#F7F3E8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-24"
          >
            <div className="max-w-3xl space-y-4">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Overview
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                This disclosure explains what cookies and similar browser storage technologies are
                used on the Casamento Events Management website, why they are used, and how you can
                control them.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                A cookie is a small text file saved to your device when you load a web page. Cookies
                help a website recognize your browser, maintain session state, and protect user-facing
                forms from automated abuse.
              </p>
            </div>
          </section>

          {/* SECTION 2: ESSENTIAL SECURITY COOKIES */}
          <section
            id="essential-security-cookies"
            className="min-h-[45vh] sm:min-h-[50vh] py-16 sm:py-20 px-6 sm:px-12 lg:px-16 bg-[#EFEAD8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-24"
          >
            <div className="max-w-3xl space-y-4">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Essential Security Cookies
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                This website employs <strong>Google reCAPTCHA v3</strong> to protect public form
                endpoints (including inquiry and booking submissions) against automated scripts, bot
                networks, and spam injection.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                To determine whether an interaction is genuine or automated, Google reCAPTCHA evaluates
                hardware and software characteristics and sets an essential security cookie.
              </p>

              {/* Technical Cookie Table */}
              <div className="overflow-x-auto my-4 border border-[#3A4F1C]/20 rounded-md">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead className="bg-[#E2DCB9] text-[#2A3A14] border-b border-[#3A4F1C]/20">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold min-w-[110px] whitespace-nowrap">Cookie Name</th>
                      <th className="py-2.5 px-3 font-semibold min-w-[100px] whitespace-nowrap">Provider</th>
                      <th className="py-2.5 px-3 font-semibold min-w-[130px] whitespace-nowrap">Category</th>
                      <th className="py-2.5 px-3 font-semibold min-w-[90px] whitespace-nowrap">Duration</th>
                      <th className="py-2.5 px-3 font-semibold min-w-[220px]">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A4F1C]/10 bg-[#EFEAD8]">
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-medium text-xs whitespace-nowrap">_GRECAPTCHA</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">Google LLC</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">Strictly Necessary</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">6 months</td>
                      <td className="py-2.5 px-3">
                        Risk analysis to prevent spam and automated bot submissions on public forms.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs sm:text-sm text-[#2A3A14]/75">
                Data collected by Google reCAPTCHA is subject to the{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#BC6F07] transition-colors"
                >
                  Google Privacy Policy
                </a>{' '}
                and{' '}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#BC6F07] transition-colors"
                >
                  Google Terms of Service
                </a>
                .
              </p>
            </div>
          </section>

          {/* SECTION 3: ADVERTISING AND COMMERCIAL TRACKING */}
          <section
            id="advertising-tracking"
            className="min-h-[45vh] sm:min-h-[50vh] py-16 sm:py-20 px-6 sm:px-12 lg:px-16 bg-[#F7F3E8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-24"
          >
            <div className="max-w-3xl space-y-4">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Advertising and Commercial Tracking
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                We do not store or deploy commercial advertising cookies on this website. Specifically:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-[#2A3A14]/90">
                <li>
                  We do not use advertising pixels, remarketing tags, or third-party conversion trackers
                  (such as Meta Pixel, Google Ads, or TikTok Pixel).
                </li>
                <li>We do not build behavioral advertising profiles based on your browsing activity.</li>
                <li>
                  We do not sell, rent, or trade visitor data or cookie identifiers to advertising
                  networks or data brokers.
                </li>
              </ul>
            </div>
          </section>

          {/* SECTION 4: MANAGING COOKIES IN YOUR BROWSER */}
          <section
            id="managing-cookies"
            className="min-h-[45vh] sm:min-h-[50vh] py-16 sm:py-20 px-6 sm:px-12 lg:px-16 bg-[#EFEAD8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-24"
          >
            <div className="max-w-3xl space-y-4">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Managing Cookies in Your Browser
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Most web browsers allow you to manage cookie preferences directly through their
                built-in settings. You can review, block, or delete cookies at any time:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[#2A3A14]/90">
                <li>
                  <strong>Google Chrome:</strong> Settings &gt; Privacy and security &gt; Third-party
                  cookies
                </li>
                <li>
                  <strong>Apple Safari:</strong> Settings &gt; Safari &gt; Advanced &gt; Privacy
                </li>
                <li>
                  <strong>Mozilla Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies
                  and Site Data
                </li>
                <li>
                  <strong>Microsoft Edge:</strong> Settings &gt; Cookies and site permissions &gt; Manage
                  and delete cookies
                </li>
              </ul>
              <p className="text-xs sm:text-sm text-[#2A3A14]/75">
                Note: Because Google reCAPTCHA is an essential security measure, blocking or disabling
                it in your browser may cause automated verification to fail, preventing inquiry and
                booking forms from completing submission.
              </p>
            </div>
          </section>

          {/* SECTION 5: INQUIRIES */}
          <section
            id="inquiries"
            className="min-h-[45vh] sm:min-h-[50vh] py-16 sm:py-20 px-6 sm:px-12 lg:px-16 bg-[#F7F3E8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-24"
          >
            <div className="max-w-3xl space-y-4">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Inquiries
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                If you have technical or compliance questions regarding our cookie practices, please
                contact us by email at{' '}
                <a
                  href="mailto:hello@casamentoevents.com"
                  className="text-[#BC6F07] underline font-medium hover:text-[#9E5B04] transition-colors"
                >
                  hello@casamentoevents.com
                </a>
                .
              </p>
              <p className="text-sm text-[#2A3A14]/70">
                For detailed disclosures on our overall data storage, guest checkout, and client rights,
                you can also review our{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#BC6F07] underline font-medium hover:text-[#9E5B04]"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

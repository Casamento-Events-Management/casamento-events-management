'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface PrivacySection {
  id: string;
  title: string;
  shortTitle: string;
}

const SECTIONS: PrivacySection[] = [
  { id: 'overview', title: 'Overview', shortTitle: 'Overview' },
  { id: 'information-we-collect', title: 'Information We Collect', shortTitle: 'Info Collected' },
  { id: 'how-we-use-information', title: 'How We Use Your Information', shortTitle: 'How We Use Info' },
  { id: 'guest-checkout-data-storage', title: 'Guest-Checkout & Data Storage Architecture', shortTitle: 'Guest Storage' },
  { id: 'third-party-security', title: 'Third-Party Integrations & Security', shortTitle: 'Third Parties' },
  { id: 'cookies-technical-tokens', title: 'Cookies & Technical Tokens', shortTitle: 'Cookies' },
  { id: 'media-portfolio-releases', title: 'Media & Client Portfolio Releases', shortTitle: 'Media Releases' },
  { id: 'data-rights-contact', title: 'Your Data Rights & Contact Information', shortTitle: 'Data Rights' },
];

export function PrivacyContent() {
  const [activeSection, setActiveSection] = useState<string>('overview');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible section closest to top
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
      const offset = 100;
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
        {/* DESKTOP LEFT SIDEBAR TAB PANEL (lg:block) */}
        <aside className="hidden lg:block lg:w-72 shrink-0 sticky top-16 lg:top-20 pt-4 pb-6 px-4 self-start">
          <div className="border-r border-[#3A4F1C]/20 pr-4 space-y-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#BC6F07] font-semibold">
                Table of Contents
              </p>
              <h2 className="text-base font-serif font-bold text-[#2A3A14] mt-0.5">
                Privacy Policy
              </h2>
              <p className="text-[11px] text-[#2A3A14]/70 mt-0.5 font-mono">
                Effective: October 2026
              </p>
            </div>

            <nav aria-label="Privacy sections" className="space-y-0.5">
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
                Have questions regarding your personal data or need assistance?
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

        {/* RIGHT CONTENT COLUMN: ALTERNATING SECTIONS WITH LARGE VIEWPORT HEIGHT */}
        <div className="flex-1 w-full overflow-hidden">
          {/* SECTION 1: OVERVIEW */}
          <section
            id="overview"
            className="min-h-[50vh] sm:min-h-[60vh] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#F7F3E8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-28"
          >
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Overview
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Casamento Events Management Inc. (“Casamento Events,” “we,” “us,” or “our”) is committed to protecting the privacy, confidentiality, and integrity of your personal information. This Privacy Policy details our operational protocols for collecting, storing, processing, and safeguarding data across our website, consultation inquiry channels, and event production operations.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Our practices comply with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173), its Implementing Rules and Regulations, and internationally recognized information security principles. By using this website, requesting event consultations, or reserving our production services, you acknowledge the data handling practices described in this policy. For questions regarding how your data is handled during transactions, refer directly to{' '}
                <a
                  href="#guest-checkout-data-storage"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo('guest-checkout-data-storage');
                  }}
                  className="text-[#BC6F07] underline hover:text-[#9E5B04] transition-colors"
                >
                  Guest-Checkout &amp; Data Storage Architecture
                </a>
                .
              </p>
            </div>
          </section>

          {/* SECTION 2: INFORMATION WE COLLECT */}
          <section
            id="information-we-collect"
            className="min-h-[50vh] sm:min-h-[60vh] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#EFEAD8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-28"
          >
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Information We Collect
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                We only gather personal information that you provide directly and voluntarily when communicating with our team, requesting bespoke event proposals, or completing consultation reservations. This data includes your legal name, business or personal email address, primary contact telephone number, event calendar dates, prospective event venue location, estimated attendee count, and specific production requirements.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                When you access our platform, our servers also automatically record essential operational and security metadata. This includes your IP address, browser user-agent string, submission timestamps, and automated risk verification scores provided by Google reCAPTCHA v3. We do not collect sensitive biometrics, personal credit card numbers, or bank account credentials on our infrastructure. For technical specifics on our anti-fraud verification scripts, please see{' '}
                <a
                  href="#cookies-technical-tokens"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo('cookies-technical-tokens');
                  }}
                  className="text-[#BC6F07] underline hover:text-[#9E5B04] transition-colors"
                >
                  Cookies &amp; Technical Tokens
                </a>
                .
              </p>
            </div>
          </section>

          {/* SECTION 3: HOW WE USE YOUR INFORMATION */}
          <section
            id="how-we-use-information"
            className="min-h-[50vh] sm:min-h-[60vh] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#F7F3E8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-28"
          >
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2A3A14] tracking-tight">
                How We Use Your Information
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Your personal details are used exclusively to evaluate, coordinate, and fulfill event management and production agreements. Specifically, our operations team uses your information to prepare customized technical styling proposals, coordinate logistics with authorized venue partners, schedule preliminary walkthroughs, issue legal billing statements, and transmit transactional booking confirmations.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                We strictly operate under a policy of non-commercialization. Casamento Events does not rent, sell, monetize, or trade your contact details with external marketing syndicates, ad brokers, or third-party mailing lists. We retain your information solely for legitimate contractual execution, regulatory tax compliance, and event coordination, as further detailed in{' '}
                <a
                  href="#third-party-security"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo('third-party-security');
                  }}
                  className="text-[#BC6F07] underline hover:text-[#9E5B04] transition-colors"
                >
                  Third-Party Integrations &amp; Security
                </a>
                .
              </p>
            </div>
          </section>

          {/* SECTION 4: GUEST-CHECKOUT & DATA STORAGE ARCHITECTURE */}
          <section
            id="guest-checkout-data-storage"
            className="min-h-[50vh] sm:min-h-[60vh] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#EFEAD8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-28"
          >
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Guest-Checkout &amp; Data Storage Architecture
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Our platform prioritizes client privacy by employing a friction-free guest checkout architecture. Clients submitting service inquiries or booking production consultations are not required to create persistent user accounts, undergo unnecessary credential registrations, or maintain stored online passwords on our web platform. Every transaction is handled as an isolated, verified booking record.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                All production and inquiry data is housed in enterprise Supabase database clusters utilizing PostgreSQL with Row-Level Security (RLS) policies strictly enforced. Database records are encrypted at rest using AES-256 and transmitted exclusively via encrypted TLS 1.3 channels. Access is restricted to authorized personnel with multi-factor authentication, ensuring complete segregation of client records. If you wish to request the deletion or retrieval of your stored booking records, review your options under{' '}
                <a
                  href="#data-rights-contact"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo('data-rights-contact');
                  }}
                  className="text-[#BC6F07] underline hover:text-[#9E5B04] transition-colors"
                >
                  Your Data Rights &amp; Contact Information
                </a>
                .
              </p>
            </div>
          </section>

          {/* SECTION 5: THIRD-PARTY INTEGRATIONS & SECURITY */}
          <section
            id="third-party-security"
            className="min-h-[50vh] sm:min-h-[60vh] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#F7F3E8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-28"
          >
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Third-Party Integrations &amp; Security
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                To maintain production reliability and high security, Casamento Events integrates with vetted enterprise service providers. Our platform hosting is powered by Vercel’s global Edge network, providing automated DDoS mitigation and continuous infrastructure health monitoring. Transactional email communications and booking notifications are routed through Resend, while online payment workflows are securely processed through Dragonpay and PayPal, both certified PCI-DSS compliant payment gateways.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                When you initiate a digital payment, your transaction details are processed directly on Dragonpay or PayPal&apos;s encrypted payment gateways; Casamento Events never views, transmits, or archives raw credit card numbers, PayPal account credentials, or banking passwords. Furthermore, public forms are fortified by Google reCAPTCHA v3 to intercept automated injection attacks. For more information on how Google manages tokens during anti-abuse evaluations, please inspect{' '}
                <a
                  href="#cookies-technical-tokens"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo('cookies-technical-tokens');
                  }}
                  className="text-[#BC6F07] underline hover:text-[#9E5B04] transition-colors"
                >
                  Cookies &amp; Technical Tokens
                </a>
                .
              </p>
            </div>
          </section>

          {/* SECTION 6: COOKIES & TECHNICAL TOKENS */}
          <section
            id="cookies-technical-tokens"
            className="min-h-[50vh] sm:min-h-[60vh] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#EFEAD8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-28"
          >
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Cookies & Technical Tokens
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Casamento Events maintains a strict policy regarding browser tracking technologies. We do not deploy third-party advertising pixels, commercial retargeting cookies (such as Meta Pixel or TikTok Tracker), or behavioral profiling beacons. Our use of browser storage is limited exclusively to essential security tokens required to maintain form integrity and detect malicious bots.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Specifically, our public inquiry forms utilize Google reCAPTCHA’s{' '}
                <code className="text-xs font-mono bg-[#3A4F1C]/10 px-1.5 py-0.5 rounded">
                  _GRECAPTCHA
                </code>{' '}
                token to perform risk scoring. You can inspect comprehensive technical specifications, cookie durations, and step-by-step browser opt-out instructions by visiting our dedicated{' '}
                <Link
                  href="/cookies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#BC6F07] underline font-semibold hover:text-[#9E5B04] transition-colors"
                >
                  Cookie Settings and Disclosure
                </Link>{' '}
                page.
              </p>
            </div>
          </section>

          {/* SECTION 7: MEDIA & CLIENT PORTFOLIO RELEASES */}
          <section
            id="media-portfolio-releases"
            className="min-h-[50vh] sm:min-h-[60vh] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#F7F3E8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-28"
          >
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Media & Client Portfolio Releases
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                As a premier event styling, lighting engineering, and broadcast cinematography entity, Casamento Events captures photographs and video recordings of our live productions. We uphold the utmost respect for our clients’ personal dignity and privacy: media highlights, teaser reels, and gallery showcases are published on our website only when explicitly authorized through signed client service agreements and release clauses.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Clients reserving private milestone events, confidential brand activations, or events governed by Non-Disclosure Agreements (NDAs) are entitled to strict media blackout terms. Under these agreements, our team will not publish or distribute any imagery, video reels, or attendee footage. Furthermore, clients retain the right to withdraw publication consent or request redaction of specific portfolio media at any time by contacting us as described in{' '}
                <a
                  href="#data-rights-contact"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo('data-rights-contact');
                  }}
                  className="text-[#BC6F07] underline hover:text-[#9E5B04] transition-colors"
                >
                  Your Data Rights &amp; Contact Information
                </a>
                .
              </p>
            </div>
          </section>

          {/* SECTION 8: YOUR DATA RIGHTS & CONTACT INFORMATION */}
          <section
            id="data-rights-contact"
            className="min-h-[50vh] sm:min-h-[60vh] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#EFEAD8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-28"
          >
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Your Data Rights & Contact Information
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Under the Philippine Data Privacy Act of 2012 (Republic Act No. 10173), you hold distinct statutory rights regarding your personal data. These include the right to be informed about how your information is processed, the right to reasonable access to your stored records, the right to rectify inaccuracies, the right to object to processing, and the right to request the erasure or blocking of your personal data from our operational databases.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                To exercise any of your statutory rights, submit formal inquiries, or file data handling requests, please contact our designated compliance team. We respond to verified data requests within two business days:
              </p>

              {/* Official Contact Details Box */}
              <div className="mt-4 p-5 text-sm space-y-2">
                <p className="font-semibold text-[#2A3A14]">
                  Casamento Events Management Inc. — Data Privacy Office
                </p>
                <p className="text-[#2A3A14]/80">
                  Email:{' '}
                  <a
                    href="mailto:hello@casamentoevents.com"
                    className="text-[#BC6F07] underline font-medium hover:text-[#9E5B04]"
                  >
                    hello@casamentoevents.com
                  </a>
                </p>
                <p className="text-[#2A3A14]/80">
                  Phone:{' '}
                  <a
                    href="tel:+639562742962"
                    className="text-[#2A3A14] font-medium hover:underline"
                  >
                    +63 956 274 2962
                  </a>
                </p>
                <p className="text-[#2A3A14]/70 text-xs">
                  Commerce Ave, Alabang, 1799 Metro Manila, Philippines
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface TermsSection {
  id: string;
  title: string;
}

const SECTIONS: TermsSection[] = [
  { id: 'overview', title: 'Overview' },
  { id: 'scope-of-services', title: 'Scope of Services' },
  { id: 'inquiries-rate-estimates', title: 'Inquiries & Rate Estimates' },
  { id: 'booking-deposits-date-reservations', title: 'Booking Deposits & Date Reservations' },
  { id: 'rescheduling-cancellations-force-majeure', title: 'Rescheduling, Cancellations & Force Majeure' },
  { id: 'intellectual-property-portfolio-rights', title: 'Intellectual Property & Portfolio Rights' },
  { id: 'user-conduct-inquiries', title: 'User Conduct & Inquiries' },
  { id: 'governing-law-dispute-resolution', title: 'Governing Law & Dispute Resolution' },
];

export function TermsContent() {
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
                Terms of Service
              </h2>
              <p className="text-[11px] text-[#2A3A14]/70 mt-0.5 font-mono">
                Effective: October 2026
              </p>
            </div>

            <nav aria-label="Terms sections" className="space-y-0.5">
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
                Have questions regarding event agreements or production terms?
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
                These Terms of Service constitute a legally binding agreement between Casamento Events Management Inc. (“Casamento Events,” “we,” “us,” or “our”) and the individual, corporate entity, or contracting party (“Client,” “you,” or “User”) accessing our website or retaining our event design, management, and technical production services.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                By submitting consultation requests through our booking platform, making date reservation deposits, or executing formal event management contracts, you affirm that you possess full legal authority to enter into these terms. Every event project is further governed by an individualized Statement of Work (SOW) or signed Service Agreement, as outlined in{' '}
                <a
                  href="#scope-of-services"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo('scope-of-services');
                  }}
                  className="text-[#BC6F07] underline hover:text-[#9E5B04] transition-colors"
                >
                  Scope of Services
                </a>
                .
              </p>
            </div>
          </section>

          {/* SECTION 2: SCOPE OF SERVICES */}
          <section
            id="scope-of-services"
            className="min-h-[50vh] sm:min-h-[60vh] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#EFEAD8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-28"
          >
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Scope of Services
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Casamento Events delivers comprehensive event planning, styling, and livestreaming solutions. Our service disciplines encompass end-to-end wedding conceptualization, turnkey corporate activations, concert-grade intelligent lighting, line-array audio systems, LED wall engineering, multi-camera live broadcasting, and full on-the-day coordination.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                The specific deliverables, staffing allocation, technical equipment specifications, venue access schedules, and milestone timelines for your engagement are codified in your formal project contract. Any modifications, additions, or scope extensions requested after contract execution must be documented in writing and will be evaluated according to{' '}
                <a
                  href="#inquiries-rate-estimates"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo('inquiries-rate-estimates');
                  }}
                  className="text-[#BC6F07] underline hover:text-[#9E5B04] transition-colors"
                >
                  Inquiries &amp; Rate Estimates
                </a>{' '}
                and{' '}
                <a
                  href="#booking-deposits-date-reservations"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo('booking-deposits-date-reservations');
                  }}
                  className="text-[#BC6F07] underline hover:text-[#9E5B04] transition-colors"
                >
                  Booking Deposits &amp; Date Reservations
                </a>
                .
              </p>
            </div>
          </section>

          {/* SECTION 3: INQUIRIES & RATE ESTIMATES */}
          <section
            id="inquiries-rate-estimates"
            className="min-h-[50vh] sm:min-h-[60vh] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#F7F3E8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-28"
          >
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Inquiries &amp; Rate Estimates
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Preliminary quotations, catalog packages, and price estimates generated through our online booking portal or preliminary consultations are intended for budgetary planning only. Rate estimates reflect prevailing equipment availability, crew staffing, logistics requirements, and venue parameters at the time of quotation.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Written estimates remain valid for thirty (30) calendar days from issuance unless otherwise noted. Quotations do not guarantee production calendar reservation or hold equipment availability until the formal booking fee has been processed as established in{' '}
                <a
                  href="#booking-deposits-date-reservations"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo('booking-deposits-date-reservations');
                  }}
                  className="text-[#BC6F07] underline hover:text-[#9E5B04] transition-colors"
                >
                  Booking Deposits &amp; Date Reservations
                </a>
                .
              </p>
            </div>
          </section>

          {/* SECTION 4: BOOKING DEPOSITS & DATE RESERVATIONS */}
          <section
            id="booking-deposits-date-reservations"
            className="min-h-[50vh] sm:min-h-[60vh] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#EFEAD8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-28"
          >
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Booking Deposits &amp; Date Reservations
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                To maintain the integrity of our production calendar and guarantee exclusivity of our technical crew and gear, event dates are reserved strictly upon receipt of an initial non-refundable reservation deposit and mutual execution of the service agreement. We accept payments through Dragonpay (local bank transfer, e-wallets, OTC) and PayPal (international debit and credit cards).
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Subsequent balance payments are structured across predetermined milestone dates detailed in your contract schedule. Full settlement of all production fees must be received prior to event load-in or technical ingress. Failure to fulfill required milestone payments within designated grace periods may result in date release subject to{' '}
                <a
                  href="#rescheduling-cancellations-force-majeure"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo('rescheduling-cancellations-force-majeure');
                  }}
                  className="text-[#BC6F07] underline hover:text-[#9E5B04] transition-colors"
                >
                  Rescheduling, Cancellations &amp; Force Majeure
                </a>
                .
              </p>
            </div>
          </section>

          {/* SECTION 5: RESCHEDULING, CANCELLATIONS & FORCE MAJEURE */}
          <section
            id="rescheduling-cancellations-force-majeure"
            className="min-h-[50vh] sm:min-h-[60vh] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#F7F3E8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-28"
          >
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Rescheduling, Cancellations &amp; Force Majeure
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Requests to reschedule a reserved event date must be submitted in writing at least sixty (60) days prior to the original calendar date. Date adjustments are subject to crew availability, equipment scheduling, and potential rate adjustments if the new date falls in an alternate calendar season. Initial booking deposits may be transferred to an approved new date within twelve (12) months.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Neither party shall be held liable for failure or delay in fulfilling contractual obligations when prevented by a Force Majeure event, including acts of God, severe typhoons (PAGASA Signal 3 or higher affecting venue travel), earthquakes, government-mandated quarantines, or active civil emergencies. In such scenarios, both parties agree to negotiate in good faith to reschedule the event. For terms regarding dispute escalations, review{' '}
                <a
                  href="#governing-law-dispute-resolution"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo('governing-law-dispute-resolution');
                  }}
                  className="text-[#BC6F07] underline hover:text-[#9E5B04] transition-colors"
                >
                  Governing Law &amp; Dispute Resolution
                </a>
                .
              </p>
            </div>
          </section>

          {/* SECTION 6: INTELLECTUAL PROPERTY & PORTFOLIO RIGHTS */}
          <section
            id="intellectual-property-portfolio-rights"
            className="min-h-[50vh] sm:min-h-[60vh] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#EFEAD8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-28"
          >
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Intellectual Property &amp; Portfolio Rights
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                All proprietary design sketches, lighting plots, technical stage schematics, audio mix masters, and website assets authored by Casamento Events remain our exclusive intellectual property. Clients receive a personal, non-exclusive license to use and share final delivered media highlights for personal celebration or internal corporate archival purposes.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                We respect our clients&apos; privacy. Production photographs and video highlight reels are published in our showcase portfolio only with explicit client release authorization in their service agreement. Clients requesting strict privacy, executive confidentiality, or Non-Disclosure Agreements (NDAs) are provided full media blackout protections as detailed in our{' '}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#BC6F07] underline font-semibold hover:text-[#9E5B04] transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </section>

          {/* SECTION 7: USER CONDUCT & INQUIRIES */}
          <section
            id="user-conduct-inquiries"
            className="min-h-[50vh] sm:min-h-[60vh] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#F7F3E8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-28"
          >
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2A3A14] tracking-tight">
                User Conduct &amp; Inquiries
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Visitors and clients using our web platform agree to provide truthful, accurate, and current contact details when submitting consultation requests, booking inquiries, and event feedback. You agree not to upload malicious payloads, conduct automated scraping, interfere with platform availability, or attempt unauthorized penetration of our server infrastructure.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                Our public inquiry forms are continuously monitored by Google reCAPTCHA v3 to prevent automated spam and abuse. Details regarding our security tokens and browser tracking policies can be examined in our{' '}
                <Link
                  href="/cookies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#BC6F07] underline font-semibold hover:text-[#9E5B04] transition-colors"
                >
                  Cookie Settings and Disclosure
                </Link>
                . Violations of conduct standards may result in service termination and civil remedies under{' '}
                <a
                  href="#governing-law-dispute-resolution"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo('governing-law-dispute-resolution');
                  }}
                  className="text-[#BC6F07] underline hover:text-[#9E5B04] transition-colors"
                >
                  Governing Law &amp; Dispute Resolution
                </a>
                .
              </p>
            </div>
          </section>

          {/* SECTION 8: GOVERNING LAW & DISPUTE RESOLUTION */}
          <section
            id="governing-law-dispute-resolution"
            className="min-h-[50vh] sm:min-h-[60vh] py-16 sm:py-24 px-6 sm:px-12 lg:px-16 bg-[#EFEAD8] text-[#2A3A14] flex flex-col justify-center border-b border-[#3A4F1C]/10 scroll-mt-28"
          >
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2A3A14] tracking-tight">
                Governing Law &amp; Dispute Resolution
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                These Terms of Service and any associated production agreements shall be governed by, construed, and enforced in accordance with the laws of the Republic of the Philippines. In the event of any dispute, claim, or controversy arising from or relating to our services, the parties pledge to make best efforts to resolve the matter through amicable consultation and mutual executive mediation.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#2A3A14]/90">
                If mediation fails to resolve the dispute within thirty (30) calendar days, the parties irrevocably agree that any resulting legal proceedings shall be instituted exclusively in the competent courts of proper jurisdiction within Metro Manila, Philippines, to the exclusion of all other courts.
              </p>

              {/* Official Legal Contact Box */}
              <div className="mt-4 p-5 text-sm space-y-2">
                <p className="font-semibold text-[#2A3A14]">
                  Casamento Events Management Inc. — Legal &amp; Operating Office
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

import React from 'react';
import type { Metadata } from 'next';
import { getContactSectionContent } from '@/lib/services/contactService';
import { ConnectSection } from '@/components/layout/connect-section';

export const metadata: Metadata = {
  title: 'Cookie Settings & Disclosure | Casamento Events Management',
  description:
    'Technical disclosure regarding cookie usage, security verification via Google reCAPTCHA, and our policy on commercial advertising cookies.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/cookies`,
  },
};

export default async function CookieSettingsPage() {
  const contactData = await getContactSectionContent();

  return (
    <div className="bg-[#F7F3E8] text-[#2A3A14] min-h-screen">
      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-20 lg:py-24">
        {/* Document Header */}
        <header className="border-b border-[#3A4F1C]/20 pb-6 mb-10">
          <h1 className="text-3xl sm:text-4xl font-serif text-[#2A3A14] tracking-tight">
            Cookie Settings and Disclosure
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#3A4F1C]/70 font-mono">
            Last updated: October 2026
          </p>
        </header>

        {/* Content Body */}
        <div className="space-y-10 text-sm sm:text-base leading-relaxed text-[#2A3A14]/90">
          {/* Section 1: Overview */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#2A3A14]">1. Overview</h2>
            <p>
              This disclosure explains what cookies and similar browser storage technologies are
              used on the Casamento Events Management website, why they are used, and how you can
              control them.
            </p>
            <p>
              A cookie is a small text file saved to your device when you load a web page. Cookies
              help a website recognize your browser, maintain session state, and protect user-facing
              forms from automated abuse.
            </p>
          </section>

          {/* Section 2: Essential Security Cookies */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#2A3A14]">
              2. Essential Security Cookies
            </h2>
            <p>
              This website employs <strong>Google reCAPTCHA v3</strong> to protect public form
              endpoints (including inquiry and booking submissions) against automated scripts, bot
              networks, and spam injection.
            </p>
            <p>
              To determine whether an interaction is genuine or automated, Google reCAPTCHA evaluates
              hardware and software characteristics and sets an essential security cookie.
            </p>

            {/* Technical Cookie Table */}
            <div className="overflow-x-auto my-4 border border-[#3A4F1C]/20 rounded-md">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-[#EFEAD8] text-[#2A3A14] border-b border-[#3A4F1C]/20">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold min-w-[110px] whitespace-nowrap">Cookie Name</th>
                    <th className="py-2.5 px-3 font-semibold min-w-[100px] whitespace-nowrap">Provider</th>
                    <th className="py-2.5 px-3 font-semibold min-w-[130px] whitespace-nowrap">Category</th>
                    <th className="py-2.5 px-3 font-semibold min-w-[90px] whitespace-nowrap">Duration</th>
                    <th className="py-2.5 px-3 font-semibold min-w-[220px]">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A4F1C]/10">
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
          </section>

          {/* Section 3: Advertising and Commercial Tracking */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#2A3A14]">
              3. Advertising and Commercial Tracking
            </h2>
            <p>
              We do not store or deploy commercial advertising cookies on this website. Specifically:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
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
          </section>

          {/* Section 4: Managing Cookies in Your Browser */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#2A3A14]">
              4. Managing Cookies in Your Browser
            </h2>
            <p>
              Most web browsers allow you to manage cookie preferences directly through their
              built-in settings. You can review, block, or delete cookies at any time:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
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
          </section>

          {/* Section 5: Inquiries */}
          <section className="space-y-3 pt-4 border-t border-[#3A4F1C]/15">
            <h2 className="text-xl font-semibold text-[#2A3A14]">5. Inquiries</h2>
            <p>
              If you have technical or compliance questions regarding our cookie practices, please
              contact us by email at{' '}
              <a
                href="mailto:hello@casamentoevents.com"
                className="underline hover:text-[#BC6F07] transition-colors"
              >
                hello@casamentoevents.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      {/* Connect / Contact Section */}
      <ConnectSection
        eyebrow={contactData.eyebrow}
        title={contactData.title}
        description={contactData.description}
        socialLinks={contactData.socialLinks}
      />
    </div>
  );
}

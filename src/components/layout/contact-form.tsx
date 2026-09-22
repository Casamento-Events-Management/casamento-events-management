'use client';

import React, { useState } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { contactFormSchema, type ContactFormData } from '@/lib/schemas/contact';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const getRecaptchaToken = async (): Promise<string | undefined> => {
    if (!recaptchaSiteKey) return undefined;
    try {
      if (typeof window !== 'undefined' && window.grecaptcha) {
        return await new Promise<string>((resolve) => {
          window.grecaptcha?.ready(() => {
            window.grecaptcha
              ?.execute(recaptchaSiteKey, { action: 'contact_submit' })
              .then((token: string) => resolve(token))
              .catch(() => resolve(''));
          });
        });
      }
    } catch {
      // Graceful fallback if script fails to execute
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);

    // Validate using Zod schema
    const result = contactFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof FormErrors;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // Execute reCAPTCHA v3
      const recaptchaToken = await getRecaptchaToken();

      const payload = {
        action: 'contact_submit',
        ...result.data,
        recaptchaToken,
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit message.');
      }

      setSubmitStatus({
        type: 'success',
        message: data.message || 'Thank you! Your message has been received. We will get back to you shortly.',
      });

      setFormData({ name: '', email: '', message: '' });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred while submitting your message. Please try again.';
      setSubmitStatus({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {recaptchaSiteKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
          strategy="lazyOnload"
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label htmlFor="contact-name" className="block text-xs uppercase tracking-wider text-[#F7F3E8]/80 font-medium mb-1.5">
              Full Name <span className="text-[#BC6F07]">*</span>
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Your full name"
              className={`w-full px-4 py-3 rounded-xl bg-[#F7F3E8]/5 border ${errors.name ? 'border-red-400 focus:ring-red-400' : 'border-[#F7F3E8]/20 focus:border-[#BC6F07] focus:ring-[#BC6F07]'
                } text-[#F7F3E8] placeholder-[#F7F3E8]/40 text-sm focus:outline-none focus:ring-1 transition-all disabled:opacity-50`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-300 font-light">{errors.name}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="contact-email" className="block text-xs uppercase tracking-wider text-[#F7F3E8]/80 font-medium mb-1.5">
              Email Address <span className="text-[#BC6F07]">*</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="name@example.com"
              className={`w-full px-4 py-3 rounded-xl bg-[#F7F3E8]/5 border ${errors.email ? 'border-red-400 focus:ring-red-400' : 'border-[#F7F3E8]/20 focus:border-[#BC6F07] focus:ring-[#BC6F07]'
                } text-[#F7F3E8] placeholder-[#F7F3E8]/40 text-sm focus:outline-none focus:ring-1 transition-all disabled:opacity-50`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-300 font-light">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="contact-message" className="block text-xs uppercase tracking-wider text-[#F7F3E8]/80 font-medium mb-1.5">
            Message <span className="text-[#BC6F07]">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="Tell us your message or inquiry..."
            className={`w-full px-4 py-3 rounded-xl bg-[#F7F3E8]/5 border ${errors.message ? 'border-red-400 focus:ring-red-400' : 'border-[#F7F3E8]/20 focus:border-[#BC6F07] focus:ring-[#BC6F07]'
              } text-[#F7F3E8] placeholder-[#F7F3E8]/40 text-sm focus:outline-none focus:ring-1 transition-all disabled:opacity-50 resize-none`}
          />
          {errors.message && (
            <p className="mt-1 text-xs text-red-300 font-light">{errors.message}</p>
          )}
        </div>

        {/* Submit Status Banner */}
        {submitStatus && (
          <div
            className={`p-4 rounded-xl flex items-start gap-3 text-xs md:text-sm ${submitStatus.type === 'success'
                ? 'bg-[#3A4F1C]/80 border border-[#BC6F07]/40 text-[#F7F3E8]'
                : 'bg-red-950/60 border border-red-500/40 text-red-200'
              }`}
          >
            {submitStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#BC6F07] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <span>{submitStatus.message}</span>
          </div>
        )}

        {/* Form Footer — Send Message Button + Legal Text */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="md"
            variant="primary"
            className="w-full sm:w-auto min-w-[200px]"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#BC6F07]" />
                Sending...
              </span>
            ) : (
              'Send Message'
            )}
          </Button>
        </div>

        {/* Compliance Text (allows hiding floating badge per Google reCAPTCHA terms) */}
        <p className="block w-full text-center text-[10px] text-[#F7F3E8]/50 font-light leading-tight pt-2">
          This site is protected by reCAPTCHA and the Google{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#BC6F07] transition-colors"
          >
            Privacy Policy
          </a>{' '}
          and{' '}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#BC6F07] transition-colors"
          >
            Terms of Service
          </a>{' '}
          apply.
        </p>
      </form>
    </>
  );
}

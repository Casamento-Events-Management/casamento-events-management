import React from 'react';

/**
 * DataPrivacyDisclaimer Component
 *
 * Renders a short, text-only data privacy notice adhering strictly to
 * the Philippine Data Privacy Act of 2012 (RA 10173).
 * Contains no icons as per explicit requirement.
 */
export function DataPrivacyDisclaimer() {
  return (
    <div className="pt-4 border-t border-[#3A4F1C]/15 mt-6">
      <p className="text-[11px] text-[#3A4F1C]/70 leading-relaxed font-light text-center sm:text-left">
        Your privacy matters to us. Personal data collected is used solely to process your booking inquiry and consultation in accordance with the Philippine Data Privacy Act of 2012 (RA 10173). We do not share your details with unauthorized third parties.
      </p>
    </div>
  );
}

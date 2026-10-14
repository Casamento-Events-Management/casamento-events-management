'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookingProgressBar } from './BookingProgressBar';
import { Step1ServiceSelect } from './Step1ServiceSelect';
import { Step2EventDetails } from './Step2EventDetails';
import { Step3PaymentSummary } from './Step3PaymentSummary';
import { ServicesDetailModal } from './ServicesDetailModal';
import { EmailValidationModal } from './EmailValidationModal';
import { BookingSuccessPage } from './BookingSuccessPage';
import { INITIAL_BOOKING_FORM_DATA } from '@/data/bookingMock';
import { isPaymentEnabled } from '@/lib/utils/envUtils';
import type {
  ServiceItem,
  ServiceAddOn,
  SelectedAddOn,
  BookingStep,
  BookingFormData,
} from '@/types';

interface BookingViewProps {
  availableServices: ServiceItem[];
}

export function BookingView({ availableServices }: BookingViewProps) {
  const searchParams = useSearchParams();
  const paymentEnabled = isPaymentEnabled();

  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState<BookingFormData>(INITIAL_BOOKING_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Email Validation & Success Page States
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [confirmedBookingReference, setConfirmedBookingReference] = useState<string>('');

  const [, startTransition] = React.useTransition();

  // Parse URL search parameters on load
  useEffect(() => {
    const serviceSlugParam = searchParams.get('service');
    const addonsParam = searchParams.get('addons'); // e.g. "addon-1,addon-2"

    if (serviceSlugParam && availableServices.length > 0) {
      const match = availableServices.find(
        (item) => item.slug.toLowerCase() === serviceSlugParam.toLowerCase()
      );

      if (match) {
        startTransition(() => {
          setSelectedService(match);

          // Pre-select add-ons if provided in URL
          let initialAddOns: SelectedAddOn[] = [];
          if (addonsParam && match.addOns) {
            const addonIdList = addonsParam.split(',');
            initialAddOns = match.addOns
              .filter((addon) => addonIdList.includes(addon.id))
              .map((addon) => ({
                id: addon.id,
                title: addon.title,
              }));
          }

          setFormData((prev) => ({
            ...prev,
            serviceId: match.id,
            serviceSlug: match.slug,
            serviceTitle: match.title,
            categorySlug: match.category.slug,
            categoryTitle: match.category.title,
            selectedAddOns: initialAddOns,
          }));
        });
      }
    }
  }, [searchParams, availableServices]);

  // Toggle optional add-ons
  const handleToggleAddOn = (addon: ServiceAddOn) => {
    setFormData((prev) => {
      const exists = prev.selectedAddOns.some((item) => item.id === addon.id);
      let updatedAddOns: SelectedAddOn[];

      if (exists) {
        updatedAddOns = prev.selectedAddOns.filter((item) => item.id !== addon.id);
      } else {
        updatedAddOns = [
          ...prev.selectedAddOns,
          {
            id: addon.id,
            title: addon.title,
          },
        ];
      }

      return {
        ...prev,
        selectedAddOns: updatedAddOns,
      };
    });
  };

  const updateFormData = (updated: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const handleStep2Next = () => {
    if (paymentEnabled) {
      setCurrentStep(3);
    } else {
      // Direct Booking Flow: Open email verification loop
      setIsValidationModalOpen(true);
    }
  };

  const handleStep3Submit = () => {
    // Payment Step Finalization: Open email verification loop
    setIsValidationModalOpen(true);
  };

  const handleConfirmBookingSuccess = (bookingReference: string) => {
    setConfirmedBookingReference(bookingReference);
    setIsValidationModalOpen(false);
    setIsBookingConfirmed(true);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleEmailUpdated = (newEmail: string) => {
    setFormData((prev) => ({ ...prev, clientEmail: newEmail }));
  };

  const handleBookAnotherService = () => {
    setIsBookingConfirmed(false);
    setCurrentStep(1);
    setSelectedService(null);
    setFormData(INITIAL_BOOKING_FORM_DATA);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className={`bg-[#EFEAD8]/60 py-8 sm:py-12 border-y border-[#3A4F1C]/10 ${!selectedService && !isBookingConfirmed ? 'min-h-[60vh] lg:min-h-[75vh] flex flex-col justify-center' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar Header (dynamic 2 or 3 steps; all checked on success) */}
        <BookingProgressBar
          currentStep={currentStep}
          paymentEnabled={paymentEnabled}
          isSuccess={isBookingConfirmed}
          onStepClick={(step) => {
            if (isBookingConfirmed) return;
            if (step === 3 && !paymentEnabled) return;
            setCurrentStep(step);
          }}
        />

        {/* Single Centered View Card */}
        <div className="w-full lg:w-[80%] max-w-5xl mx-auto">
          {/* Confirmed Success Page View (replaces form container) */}
          {isBookingConfirmed ? (
            <BookingSuccessPage
              formData={formData}
              bookingReference={confirmedBookingReference}
              onBookAnother={handleBookAnotherService}
            />
          ) : (
            <>
              {currentStep === 1 && (
                <Step1ServiceSelect
                  service={selectedService}
                  selectedAddOns={formData.selectedAddOns}
                  onToggleAddOn={handleToggleAddOn}
                  onNextStep={() => setCurrentStep(2)}
                  onOpenModal={() => setIsDetailModalOpen(true)}
                />
              )}

              {currentStep === 2 && (
                <Step2EventDetails
                  formData={formData}
                  service={selectedService}
                  onChange={updateFormData}
                  onNextStep={handleStep2Next}
                  onPrevStep={() => setCurrentStep(1)}
                  onOpenModal={() => setIsDetailModalOpen(true)}
                  paymentEnabled={paymentEnabled}
                />
              )}

              {currentStep === 3 && paymentEnabled && (
                <Step3PaymentSummary
                  formData={formData}
                  service={selectedService}
                  onChange={updateFormData}
                  onSubmit={handleStep3Submit}
                  onPrevStep={() => setCurrentStep(2)}
                  onOpenModal={() => setIsDetailModalOpen(true)}
                  isSubmitting={isSubmitting}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Service Detail Popup Modal */}
      <ServicesDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        service={selectedService}
      />

      {/* Email Verification Loop Modal */}
      <EmailValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        formData={formData}
        onConfirmSuccess={handleConfirmBookingSuccess}
        onEmailUpdated={handleEmailUpdated}
      />
    </section>
  );
}

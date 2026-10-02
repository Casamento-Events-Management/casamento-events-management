'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookingProgressBar } from './BookingProgressBar';
import { Step1ServiceSelect } from './Step1ServiceSelect';
import { Step2EventDetails } from './Step2EventDetails';
import { Step3PaymentSummary } from './Step3PaymentSummary';
import { ServicesDetailModal } from './ServicesDetailModal';
import { INITIAL_BOOKING_FORM_DATA } from '@/data/bookingMock';
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
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState<BookingFormData>(INITIAL_BOOKING_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

  const handleFormSubmit = () => {
    setIsSubmitting(true);
    console.log('[BookingView] Submitting booking payload to backend slot:', formData);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <section className={`bg-[#EFEAD8]/60 py-8 sm:py-12 border-y border-[#3A4F1C]/10 ${!selectedService ? 'min-h-[60vh] lg:min-h-[75vh] flex flex-col justify-center' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar Header */}
        <BookingProgressBar
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
        />

        {/* Single Centered Form Card (80% section width on desktop) */}
        <div className="w-full lg:w-[80%] max-w-5xl mx-auto">
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
              onNextStep={() => setCurrentStep(3)}
              onPrevStep={() => setCurrentStep(1)}
              onOpenModal={() => setIsDetailModalOpen(true)}
            />
          )}

          {currentStep === 3 && (
            <Step3PaymentSummary
              formData={formData}
              service={selectedService}
              onChange={updateFormData}
              onSubmit={handleFormSubmit}
              onPrevStep={() => setCurrentStep(2)}
              onOpenModal={() => setIsDetailModalOpen(true)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>

      {/* Service Detail Popup Modal */}
      <ServicesDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        service={selectedService}
      />
    </section>
  );
}

'use client';

import React from 'react';
import type { BookingStep } from '@/types';
import { isPaymentEnabled } from '@/lib/utils/envUtils';

interface BookingProgressBarProps {
  currentStep: BookingStep;
  onStepClick?: (step: BookingStep) => void;
  paymentEnabled?: boolean;
  isSuccess?: boolean;
}

export function BookingProgressBar({
  currentStep,
  onStepClick,
  paymentEnabled = isPaymentEnabled(),
  isSuccess = false,
}: BookingProgressBarProps) {
  const allSteps: { step: BookingStep; label: string }[] = [
    { step: 1, label: 'Service Selection' },
    { step: 2, label: 'Event Details' },
    ...(paymentEnabled ? [{ step: 3 as BookingStep, label: 'Payment & Review' }] : []),
  ];

  return (
    <div className="w-full p-3 sm:p-4 mb-8">
      <div className="flex items-center justify-between max-w-xl mx-auto">
        {allSteps.map((item, idx) => {
          const isActive = !isSuccess && currentStep === item.step;
          const isCompleted = isSuccess || currentStep > item.step;

          return (
            <React.Fragment key={item.step}>
              <div
                onClick={() => !isSuccess && isCompleted && onStepClick && onStepClick(item.step)}
                className={`flex items-center space-x-2 transition-all ${
                  !isSuccess && isCompleted ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-[#3A4F1C] text-[#F7F3E8] ring-2 ring-[#BC6F07] ring-offset-1'
                      : isCompleted
                      ? 'bg-[#BC6F07] text-[#F7F3E8]'
                      : 'bg-[#3A4F1C]/10 text-[#3A4F1C]/50'
                  }`}
                >
                  {isCompleted ? '✓' : item.step}
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium hidden sm:inline-block ${
                    isActive
                      ? 'text-[#3A4F1C] font-semibold'
                      : isCompleted
                      ? 'text-[#3A4F1C]/80'
                      : 'text-[#3A4F1C]/40'
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {idx < allSteps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-all ${
                    isSuccess || currentStep > idx + 1 ? 'bg-[#BC6F07]' : 'bg-[#3A4F1C]/15'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

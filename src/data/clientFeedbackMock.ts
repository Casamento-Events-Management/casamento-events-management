import type { ClientFeedback } from '@/types';

export const clientFeedbackMockItems: ClientFeedback[] = [
  {
    _id: 'mock-feedback-1',
    _type: 'clientFeedback',
    _createdAt: '2026-08-15T10:00:00Z',
    _updatedAt: '2026-08-15T10:00:00Z',
    _rev: 'mock-rev-1',
    name: 'Sophia & Alexander Wright',
    eventType: 'Luxury Wedding',
    rating: 5,
    message:
      'Casamento Events made our wedding day absolutely seamless and breathtaking. From the initial consultation to the final dance, their team executed every single detail with elegance, precision, and passion. We could not have asked for a better event coordinator!',
    submittedAt: '2026-08-15T10:00:00Z',
  },
  {
    _id: 'mock-feedback-2',
    _type: 'clientFeedback',
    _createdAt: '2026-07-22T14:30:00Z',
    _updatedAt: '2026-07-22T14:30:00Z',
    _rev: 'mock-rev-2',
    name: 'Isabella Marie Santos',
    eventType: '18th Debutante Ball',
    rating: 5,
    message:
      'My 18th debut was a total dream come true! The stage production, floral design, and coordination were flawless. Everyone was praising how organized the night was. Thank you Casamento team for making me feel like royalty!',
    submittedAt: '2026-07-22T14:30:00Z',
  },
  {
    _id: 'mock-feedback-3',
    _type: 'clientFeedback',
    _createdAt: '2026-06-10T09:15:00Z',
    _updatedAt: '2026-06-10T09:15:00Z',
    _rev: 'mock-rev-3',
    name: 'Marcus & Chloe Reyes',
    eventType: 'Destination Wedding',
    rating: 5,
    message:
      'Planning a destination wedding from abroad seemed daunting until we hired Casamento Events. They handled vendor management, logistics, and design impeccably. Highly recommended for couples wanting a stress-free celebration!',
    submittedAt: '2026-06-10T09:15:00Z',
  },
];

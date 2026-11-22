import React from 'react';
import {
  Award,
  CheckCircle2,
  Clock3,
  Compass,
  Eye,
  Flame,
  Gem,
  Handshake,
  Heart,
  Layers3,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react';
import type { AboutIconName } from '@/types';

const ABOUT_ICON_MAP: Record<AboutIconName, LucideIcon> = {
  Heart,
  Sparkles,
  Award,
  ShieldCheck,
  Flame,
  Users,
  Clock3,
  Layers3,
  Lightbulb,
  Video,
  MapPin,
  Handshake,
  Target,
  Eye,
  Star,
  Compass,
  CheckCircle2,
  Gem,
};

interface AboutIconProps {
  name?: AboutIconName | string;
  className?: string;
}

export function AboutIcon({ name, className = 'w-6 h-6' }: AboutIconProps) {
  const IconComponent =
    (name && ABOUT_ICON_MAP[name as AboutIconName]) || Sparkles;

  return <IconComponent className={className} aria-hidden="true" />;
}

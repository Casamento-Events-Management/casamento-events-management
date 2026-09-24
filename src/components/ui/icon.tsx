import React from 'react';
import Image from 'next/image';
import iconImg from '@/app/icon.png';

interface IconProps {
  size?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
}

export function Icon({
  size = 40,
  className = '',
  alt = 'Casamento Events Management Icon',
  priority = false,
}: IconProps) {
  return (
    <Image
      src={iconImg}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={className}
    />
  );
}

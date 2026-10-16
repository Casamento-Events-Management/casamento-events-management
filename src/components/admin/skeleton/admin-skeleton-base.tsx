import React from 'react';

export function SkeletonPulse({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[#3A4F1C]/10 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonLine({
  width = 'w-full',
  height = 'h-4',
  className = '',
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return <SkeletonPulse className={`${width} ${height} ${className}`} />;
}

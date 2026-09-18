import React from 'react';

interface BadgeProps {
  status?: 'upcoming' | 'sold-out' | 'completed' | string;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ status = 'upcoming', children, className = '' }: BadgeProps) {
  const statusStyles = {
    upcoming: 'bg-[#3A4F1C] text-[#F7F3E8] border-[#BC6F07]/40',
    'sold-out': 'bg-[#8C2D19] text-[#F7F3E8] border-red-300',
    completed: 'bg-[#5C6650] text-[#F7F3E8] border-gray-400',
  };

  const currentStyle = statusStyles[status as keyof typeof statusStyles] || 'bg-[#3A4F1C] text-[#F7F3E8]';

  const label = children || (status ? status.replace('-', ' ') : '');

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border shadow-xs ${currentStyle} ${className}`}
    >
      {label}
    </span>
  );
}

import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#BC6F07] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs tracking-wider uppercase rounded-full',
    md: 'px-6 py-3 text-sm tracking-wider uppercase rounded-full',
    lg: 'px-8 py-4 text-base tracking-wider uppercase rounded-full',
  };

  const variantStyles = {
    primary: 'bg-[#3A4F1C] text-[#F7F3E8] hover:bg-[#2A3A14] border border-[#BC6F07]/40 shadow-sm hover:shadow',
    secondary: 'bg-[#F7F3E8] text-[#3A4F1C] hover:bg-[#EFEAD8] border border-[#3A4F1C]/20 shadow-sm',
    outline: 'bg-transparent text-[#3A4F1C] border border-[#3A4F1C] hover:bg-[#3A4F1C] hover:text-[#F7F3E8]',
    ghost: 'bg-transparent text-[#3A4F1C] hover:bg-[#EFEAD8]/60',
  };

  const combinedClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}

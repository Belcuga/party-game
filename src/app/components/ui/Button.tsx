import React from 'react';
import clsx from 'clsx';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export default function Button({ children, onClick, disabled, className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "py-3 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
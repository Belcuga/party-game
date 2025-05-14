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
        "px-6 py-3 rounded font-bold transition-all",
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-300 hover:to-blue-400 text-white shadow-md",
        className
      )}
    >
      {children}
    </button>
  );
}
import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  type?: 'toggle' | 'radio';
  size?: 'small' | 'large';
}

export default function Switch({ checked, onChange, label, type = 'toggle', size = 'small' }: SwitchProps) {
  const sizeClasses = size === 'small' 
    ? {
        switch: 'w-10 h-6 p-0.5',
        circle: 'w-5 h-5',
        position: checked ? 'right-0.5' : 'left-0.5'
      }
    : {
        switch: 'w-14 h-7 p-1',
        circle: 'w-5 h-5',
        position: checked ? 'right-1' : 'left-1'
      };

  return (
    <div className="flex items-center gap-3 select-none">
      <button
        type="button"
        onClick={onChange}
        className={`relative ${sizeClasses.switch} rounded-full transition-colors cursor-pointer overflow-hidden ${
          checked 
            ? 'bg-gradient-to-r from-[#00E676] to-[#2196F3]' 
            : 'bg-[#3b1b5e]'
        }`}
      >
        <div 
          className={`absolute ${sizeClasses.circle} rounded-full bg-white shadow-md transition-all duration-200
            ${sizeClasses.position} top-1/2 -translate-y-1/2`}
        />
      </button>
      {label && (
        <span className="text-sm font-medium text-white">
          {label}
        </span>
      )}
    </div>
  );
} 
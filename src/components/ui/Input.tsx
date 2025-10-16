// components/CustomInput.tsx
import React, { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<CustomInputProps> = ({ label, error, icon, className, ...props }) => {
  return (
    <div className="flex flex-col w-full">
      {label && <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative w-full">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input
          className={clsx(
            'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
            icon ? 'pl-10' : '',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          {...props}
        />
      </div>
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default Input;

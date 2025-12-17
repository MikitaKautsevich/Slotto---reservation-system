"use client";

import React, { SelectHTMLAttributes } from "react";
import clsx from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  icon?: React.ReactNode;
  options: string[];
}

const Select: React.FC<SelectProps> = ({ error, icon, options, className, ...props }) => {
  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white">{icon}</span>}
        <select
          className={clsx(
            'w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none',
            icon ? 'pl-10' : '',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}

          
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          ▼
        </span>
      </div>
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default Select;

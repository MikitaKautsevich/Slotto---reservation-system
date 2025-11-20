import React from 'react';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function Search({ value, onChange, placeholder = 'Search...', className = '' }: SearchProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-4 pl-12 rounded-xl border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
      />
      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔍</span>
    </div>
  );
}

"use client";

import { ButtonHTMLAttributes, FC } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: FC<ButtonProps> = ({ children, className = "", disabled, ...props }) => {
  return (
    <button
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg text-white font-medium transition
        ${disabled 
          ? "bg-gray-500 cursor-not-allowed opacity-40" // затемнённый фон и полупрозрачность
          : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

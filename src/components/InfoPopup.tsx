"use client";

import { FC, ReactNode, MouseEvent, useEffect } from "react";
import Button from "@/components/ui/Button";

interface InfoPopupProps {
  title: string;
  message: string | ReactNode;
  onClose: () => void;
}

const InfoPopup: FC<InfoPopupProps> = ({ title, message, onClose }) => {
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-white/60 backdrop-blur-[2px]"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full animate-fadeIn border border-gray-100">
        <h2 className="text-lg font-semibold mb-3 text-center">{title}</h2>
        <div className="text-center text-gray-700 mb-5">{message}</div>
        <div className="flex justify-center">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 w-28"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InfoPopup;

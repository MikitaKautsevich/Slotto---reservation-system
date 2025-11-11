"use client";

import { FC, ReactNode, MouseEvent, useEffect } from "react";
import Button from "@/components/custom/Button";

interface PopupProps {
  title: string;
  message: string | ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}

const Popup: FC<PopupProps> = ({ title, message, onConfirm, onClose }) => {
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
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
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-green-600 hover:bg-green-700 w-24"
          >
            YES
          </Button>
          <Button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 w-24"
          >
            NO
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Popup;

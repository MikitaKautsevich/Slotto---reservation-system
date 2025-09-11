"use client";

import { FC, ReactNode } from "react";
import Button from "@/components/ui/Button";

interface PopupProps {
  title: string;
  message: string | ReactNode;
  onClose: () => void;
}

const Popup: FC<PopupProps> = ({ title, message, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full animate-fadeIn">
        <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
        <div className="text-center mb-6">{message}</div>
        <div className="flex justify-center">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 w-32">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Popup;

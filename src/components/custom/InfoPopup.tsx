'use client';

import { FC, ReactNode, MouseEvent, useEffect } from "react";
import Button from "@/components/custom/Button";

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
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-md animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-tr from-gray-900/80 to-gray-800/70 border border-cyan-500 rounded-3xl shadow-neon p-6 max-w-sm w-full relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full bg-cyan-400/20 blur-3xl animate-blob"></div>
        <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl animate-blob animation-delay-1000"></div>

        <h2 className="text-xl font-bold text-center text-white drop-shadow-lg mb-3">{title}</h2>
        <div className="text-center text-white/80 mb-6">{message}</div>
        <div className="flex justify-center">
          <Button
            onClick={onClose}
            className="bg-cyan-500 hover:bg-cyan-400 text-black shadow-neon-button w-28 transition-transform hover:scale-105"
          >
            OK
          </Button>
        </div>
      </div>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .shadow-neon {
          box-shadow: 0 0 20px rgba(0,255,255,0.3), 0 0 40px rgba(255,0,255,0.2);
        }
        .shadow-neon-button {
          box-shadow: 0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff80;
        }
        .animate-blob {
          animation: blob 6s infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(20px, -10px) scale(1.05); }
          66% { transform: translate(-20px, 10px) scale(0.95); }
        }
      `}</style>
    </div>
  );
};

export default InfoPopup;

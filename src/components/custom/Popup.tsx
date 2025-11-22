'use client';

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
    if (e.target === e.currentTarget) onClose();
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
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-md animate-fadeIn overflow-hidden"
      onClick={handleBackdropClick}
    >
      {/* Звёздочки вокруг */}
      {[...Array(30)].map((_, i) => {
        const size = Math.random() * 3 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 5;
        return (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-70 animate-star"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              top: `${posY}%`,
              left: `${posX}%`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}

      <div className="relative bg-gradient-to-tr from-gray-900/90 to-gray-800/80 border border-purple-500 rounded-3xl shadow-neon p-6 max-w-sm w-full animate-float">
        {/* Анимированные blobs */}
        <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full bg-purple-400/20 blur-3xl animate-blob"></div>
        <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full bg-cyan-400/20 blur-3xl animate-blob animation-delay-1000"></div>

        <h2 className="text-xl font-bold text-center text-white drop-shadow-lg mb-3">{title}</h2>
        <div className="text-center text-white/80 mb-6">{message}</div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-green-500 hover:bg-green-400 text-black shadow-neon-button w-24 transition-transform hover:scale-105"
          >
            YES
          </Button>
          <Button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-400 text-black shadow-neon-button w-24 transition-transform hover:scale-105"
          >
            NO
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
          box-shadow: 0 0 20px rgba(255,0,255,0.3), 0 0 40px rgba(0,255,255,0.2);
        }
        .shadow-neon-button {
          box-shadow: 0 0 10px #0ff, 0 0 20px #0ff80, 0 0 30px #ff0ff0;
        }
        .animate-blob {
          animation: blob 6s infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(15px, -10px) scale(1.05); }
          66% { transform: translate(-15px, 10px) scale(0.95); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-star {
          animation: twinkle 2s infinite alternate;
        }
        @keyframes twinkle {
          0% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.3; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
};

export default Popup;

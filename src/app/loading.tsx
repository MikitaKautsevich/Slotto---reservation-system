'use client';

export const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black/5 text-white relative overflow-hidden">

      {/* Neon background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-purple-600/20 rounded-full blur-[130px] animate-pulse delay-500"></div>
      </div>

      <div className="flex flex-col items-center z-10">
        {/* Animated dots */}
        <div className="flex space-x-3 mb-6">
          <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-4 h-4 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-4 h-4 bg-pink-400 rounded-full animate-bounce"></div>
        </div>
        <p className="text-lg font-semibold tracking-wide text-white/80 animate-fadeIn">Loading...</p>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-12px);
          }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
  );
};

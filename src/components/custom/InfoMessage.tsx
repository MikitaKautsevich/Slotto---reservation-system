import React from "react";

type InfoMessageType = "info" | "warning" | "success" | "error";

interface InfoMessageProps {
  type?: InfoMessageType;
  title?: string;
  message: string;
  className?: string;
}

export const InfoMessage: React.FC<InfoMessageProps> = ({
  type = "info",
  title,
  message,
  className = "",
}) => {
  const iconMap: Record<InfoMessageType, string> = {
    info: "ℹ️",
    warning: "⚠️",
    success: "✅",
    error: "❌",
  };

  const colorMap: Record<InfoMessageType, string> = {
    info: "border-blue-300 bg-blue-50 text-blue-700",
    warning: "border-yellow-300 bg-yellow-50 text-yellow-700",
    success: "border-green-300 bg-green-50 text-green-700",
    error: "border-red-300 bg-red-50 text-red-700",
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 shadow-sm ${colorMap[type]} ${className}`}
    >
      <div className="text-xl">{iconMap[type]}</div>
      <div>
        {title && <h3 className="font-semibold">{title}</h3>}
        <p className="text-sm opacity-90">{message}</p>
      </div>
    </div>
  );
};

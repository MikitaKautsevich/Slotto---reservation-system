"use client";

import { useState } from "react";

export default function SpotlightSearch({ value, onChange }) {
  const [focus, setFocus] = useState(false);

  return (
    <div
      className={`
        relative transition 
        ${focus ? "scale-[1.02]" : "scale-100"}
      `}
    >
      {/* Glow effect */}
      <div
        className={`
          absolute inset-0 blur-xl transition-opacity -z-10
          ${focus ? "opacity-40 bg-blue-500/30" : "opacity-0"}
        `}
      />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder="Explore companies..."
        className="
          w-full px-5 py-3 rounded-2xl
          bg-white/70 backdrop-blur-xl
          border border-white/40 shadow-lg
          focus:outline-none
          text-gray-900 placeholder-gray-400
        "
      />
    </div>
  );
}

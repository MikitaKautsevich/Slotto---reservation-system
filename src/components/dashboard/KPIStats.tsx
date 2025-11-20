"use client";

import { motion } from "framer-motion";

export default function KPIStats({ companies }) {
  const total = companies.length;
  const topRating = companies[0]?.rating || 0;
  const categories = new Set(companies.map(c => c.category)).size;

  const stats = [
    { label: "Companies", value: total },
    { label: "Top Rating", value: topRating },
    { label: "Categories", value: categories },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((s, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.05, rotateX: 5, rotateY: -5 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="
            p-6 rounded-2xl
            bg-white/20 backdrop-blur-2xl shadow-2xl
            border border-white/30
            text-gray-900 font-semibold
          "
        >
          <p className="text-lg opacity-70">{s.label}</p>
          <p className="text-3xl font-extrabold mt-1">{s.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

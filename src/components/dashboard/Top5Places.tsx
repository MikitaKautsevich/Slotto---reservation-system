"use client";

import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";

export default function Top5Places({ places }: { places: any[] }) {
  return (
    <section className="relative py-20">
      {/* soft ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-pink-500/20 blur-3xl opacity-50 pointer-events-none" />

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-extrabold mb-12 text-center text-gray-900 tracking-tight"
      >
        Top 5 Places — Spotlight Edition
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center text-lg text-gray-600 max-w-2xl mx-auto mb-16"
      >
        Experience the most popular, highest-rated places in a cinematic 3D showcase.
      </motion.p>

      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-10">
        {places.map((place, index) => (
          <motion.div
            key={place.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
          >
            <Tilt
              perspective={1600}
              glareEnable={true}
              glareColor="white"
              glareMaxOpacity={0.35}
              glarePosition="all"
              scale={1.05}
              tiltMaxAngleX={15}
              tiltMaxAngleY={15}
              transitionSpeed={1500}
              className="rounded-3xl overflow-hidden shadow-2xl bg-black relative group"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {/* image */}
              <div
                className="h-64"
                style={{
                  backgroundImage: `url(${
                    place.image ||
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              {/* gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90 pointer-events-none" />

              {/* content */}
              <div
                className="absolute bottom-0 left-0 right-0 p-5 text-white"
                style={{ transform: "translateZ(60px)" }}
              >
                <h3 className="text-2xl font-extrabold drop-shadow-xl">
                  {place.name}
                </h3>

                <p className="text-sm text-gray-300 mt-1">{place.category}</p>

                <div className="mt-4">
                  <span className="text-yellow-400 font-bold text-lg">
                    ⭐ {place.rating || "0.0"}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="mt-4 px-4 py-2 bg-white/90 text-black rounded-xl font-semibold shadow-xl"
                  style={{ transform: "translateZ(80px)" }}
                >
                  View Details →
                </motion.button>
              </div>

              {/* soft glow */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-60 h-60 bg-white/20 blur-3xl group-hover:bg-white/40 transition duration-700" />
            </Tilt>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

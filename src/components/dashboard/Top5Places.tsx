"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function PlacesShowcase({ places }: { places: any[] }) {
  return (
    <section className="py-24 w-full relative overflow-hidden">

      {/* Ambient global glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-700/20 via-indigo-600/10 to-pink-500/20 blur-3xl opacity-60 pointer-events-none" />

      {/* HEADER */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-6xl font-extrabold text-center text-white tracking-tight mb-16"
      >
        Top Places to Explore
      </motion.h2>

      {/* SLIDER WRAPPER */}
      <div className="relative w-full max-w-[1800px] mx-auto px-6">

        <Swiper
          modules={[Navigation, Pagination]}
          slidesPerView={1.1}
          centeredSlides
          loop
          navigation={{
            nextEl: ".nextArrow",
            prevEl: ".prevArrow",
          }}
          pagination={{
            clickable: true,
            bulletClass: "swiper-pagination-bullet !bg-white/30",
            bulletActiveClass: "!bg-white",
          }}
          spaceBetween={60}
          className="h-[700px] rounded-3xl"
        >
          {places.map((place, i) => (
            <SwiperSlide key={place.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                className="
                  relative w-full h-full rounded-3xl overflow-hidden group 
                  shadow-[0_40px_120px_-20px_rgba(0,0,0,0.5)]
                "
              >
                {/* BACKGROUND (deep parallax) */}
                <div
                  className="
                    absolute inset-0 bg-cover bg-center 
                    transition-transform duration-[2000ms] ease-out 
                    group-hover:scale-110
                  "
                  style={{
                    backgroundImage: `url(${place.image})`,
                  }}
                />

                {/* MULTILAYER CINEMATIC GRADIENT */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                {/* GLASS PANEL — VisionOS */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                  className="
                    absolute bottom-12 left-12 p-10 
                    backdrop-blur-2xl bg-white/10 border border-white/20 
                    rounded-3xl shadow-xl text-white max-w-xl
                  "
                  style={{
                    boxShadow:
                      "0 30px 100px rgba(255,255,255,0.08), inset 0 0 30px rgba(255,255,255,0.08)",
                  }}
                >
                  <h3 className="text-4xl font-extrabold drop-shadow-xl">
                    {place.name}
                  </h3>

                  <p className="mt-3 text-white/80 text-lg">
                    {place.category}
                  </p>

                  <div className="flex items-center gap-6 mt-6">
                    <span className="text-yellow-400 font-bold text-xl">
                      ⭐ {place.rating}
                    </span>
                    <span className="text-white/70 text-lg">
                      📍 {place.location ?? "Unknown"}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.92 }}
                    className="
                      mt-6 px-6 py-3 bg-white text-black 
                      rounded-xl font-semibold shadow-lg 
                      hover:bg-gray-100 transition
                    "
                  >
                    View Details →
                  </motion.button>
                </motion.div>

                {/* Light sweep effect */}
                <div
                  className="
                    absolute inset-0 
                    bg-gradient-to-r from-transparent via-white/10 to-transparent
                    opacity-0 group-hover:opacity-50 
                    transition duration-[1200ms]
                  "
                />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* BEAUTIFUL CUSTOM ARROWS */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="
            prevArrow absolute top-1/2 -left-2 -translate-y-1/2 
            text-white text-4xl z-20 p-4 rounded-full 
            bg-white/10 backdrop-blur-xl border border-white/20 
            shadow-xl hover:bg-white/20
          "
        >
          ‹
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="
            nextArrow absolute top-1/2 -right-2 -translate-y-1/2 
            text-white text-4xl z-20 p-4 rounded-full 
            bg-white/10 backdrop-blur-xl border border-white/20
            shadow-xl hover:bg-white/20
          "
        >
          ›
        </motion.button>
      </div>
    </section>
  );
}

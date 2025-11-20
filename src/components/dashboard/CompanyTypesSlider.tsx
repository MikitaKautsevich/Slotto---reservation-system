"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function CategoriesSlider() {
  // Твои категории — можешь менять/расширять
  const categories = [
    {
      title: "Beauty & Spa",
      subtitle: "Beauty salons, stylists, nails, cosmetology",
      image:
        "https://images.unsplash.com/photo-1522336572468-97b06e8ef143?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Gastro & Food",
      subtitle: "Restaurants, cafes, bakeries and gourmet places",
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Fitness & Health",
      subtitle: "Gyms, trainers, wellness centers, yoga studios",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Automotive",
      subtitle: "Car services, detailing, auto salons, repair",
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Medical",
      subtitle: "Clinics, doctors, dentistry, diagnostics",
      image:
        "https://images.unsplash.com/photo-1583912086094-c9f3a981f43e?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Shopping & Retail",
      subtitle: "Fashion, boutiques, electronics and more",
      image:
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Services",
      subtitle: "Cleaning, repair, tutoring, consulting",
      image:
        "https://images.unsplash.com/photo-1581579188871-45ea61f2a0c8?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  return (
    <section className="py-20 space-y-8">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-bold text-center text-white mb-20 drop-shadow-xl"
      >
        Explore Categories
      </motion.h2>
      <div className="w-full rounded-3xl overflow-hidden shadow-2xl relative">
        {/* ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-pink-500/10 blur-2xl pointer-events-none" />

        <Swiper
          modules={[Pagination, Navigation]}
          pagination={{ clickable: true }}
          navigation
          loop
          slidesPerView={1.2}
          centeredSlides
          spaceBetween={50}
          className="h-[460px]"
        >
          {categories.map((cat, i) => (
            <SwiperSlide key={i}>
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.8,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
                className="relative w-full h-full rounded-3xl overflow-hidden group"
              >
                {/* Parallax background */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[3500ms] ease-out group-hover:scale-110"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />

                {/* Cinematic gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Vision Pro GLASS CARD */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                  className="absolute left-10 bottom-10 p-6 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl text-white"
                  style={{
                    boxShadow:
                      "0 20px 60px rgba(255,255,255,0.05), inset 0 0 20px rgba(255,255,255,0.08)",
                  }}
                >
                  <h3 className="text-3xl font-extrabold drop-shadow-xl">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-white/80 text-lg max-w-sm">
                    {cat.subtitle}
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 px-5 py-2 bg-white text-black font-semibold rounded-xl shadow-md hover:bg-gray-100 transition"
                  >
                    View category →
                  </motion.button>
                </motion.div>

                {/* Glass shine on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-40 transition duration-700" />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useAnimation, useInView } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import CompanyTypesSlider from "@/components/dashboard/CompanyTypesSlider";
import { FaHistory, FaSearch, FaRegSmileBeam } from "react-icons/fa";
import { IoPerson } from "react-icons/io5";
import { RiAdminFill } from "react-icons/ri";
import { MdEventAvailable } from "react-icons/md";

export default function HomePage({ children }) {
  const heroRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [slottoText, setSlottoText] = useState("");
  const [showCursor, setShowCursor] = useState(true);


  useEffect(() => {
    const lenis = new Lenis({ smooth: true, lerp: 0.1 });
    function raf(t) {
      lenis.raf(t);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  // Typing effect for Slotto
  useEffect(() => {
    const fullText = "Slotto";
    let index = 0;
    const interval = setInterval(() => {
      setSlottoText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) {
        clearInterval(interval);
        setTimeout(() => {
          setShowCursor(false);
        }, 100);
      }
    }, 200); // медленная скорость
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: (e.clientX - rect.left - rect.width / 2) / 50,
      y: (e.clientY - rect.top - rect.height / 2) / 50,
    });
  };

  const FadeInSection = ({ children }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    const controls = useAnimation();

    useEffect(() => {
      if (inView) controls.start("visible");
    }, [inView]);

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0, y: 80 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" } },
        }}
      >
        {children}
      </motion.div>
    );
  };

  const infoCards = [
    { title: "Easy Booking", description: "Quickly reserve your spot.", icon: <MdEventAvailable /> },
    { title: "Booking History", description: "Track all your past bookings.", icon: <FaHistory /> },
    { title: "Admin Management", description: "Manage the system effortlessly.", icon: <RiAdminFill /> },
  ];

  const steps = [
    { title: "Search", description: "Find exactly what you need.", icon: <FaSearch /> },
    { title: "Book", description: "Reserve instantly.", icon: <MdEventAvailable /> },
    { title: "Enjoy", description: "Relax & get confirmation.", icon: <FaRegSmileBeam /> },
  ];

  const reviews = [
    { name: "Anna P.", text: "Super convenient! Instant confirmation.", rating: 5, icon: <IoPerson /> },
    { name: "Ivan K.", text: "Love the design & simplicity.", rating: 4, icon: <IoPerson /> },
    { name: "Maria S.", text: "Amazing service!", rating: 5, icon: <IoPerson /> },
  ];

  return (
    <main className="relative w-full overflow-hidden bg-[#030617] text-white">
      {/* HERO SECTION */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[110vh] flex flex-col items-center justify-center text-center px-6 z-10"
      >
        {/* Soft parallax glow */}
        <motion.div
          style={{ x: mouse.x * -15, y: mouse.y * -15 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_70%)]"
        />

        {/* Slotto typed title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-7xl sm:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 leading-tight drop-shadow-lg"
        >
          {slottoText}
          {showCursor && <span className="blinking-cursor">|</span>}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mt-3 max-w-2xl text-lg sm:text-xl font-semibold relative inline-block"
        >
          powered by{" "}
          <motion.span
            className="font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 bg-clip-text text-transparent"
            initial={{ backgroundPosition: "0% 50%" }}
            animate={{ backgroundPosition: "100% 50%" }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          >
            OKANO
          </motion.span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="text-xl sm:text-2xl text-white/70 mt-8 max-w-3xl"
        >
          A futuristic way to book, manage and explore services in the digital cosmos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex gap-6 mt-14"
        >
          <Link
            href="/login"
            className="px-10 py-4 bg-blue-600 rounded-2xl text-white text-lg font-semibold shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:bg-blue-700 transition-all hover:scale-105"
          >
            Try Now
          </Link>
          <Link
            href="/contact"
            className="px-10 py-4 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl text-white shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:bg-white/10 transition-all hover:scale-105"
          >
            Contact Us
          </Link>
        </motion.div>

        <div className="absolute bottom-14 text-white/50 text-xl animate-bounce tracking-widest">
          SCROLL ↓
        </div>
      </section>

      {/* INFO CARDS */}
      <FadeInSection>
        <section className="py-28 max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center text-white mb-20 drop-shadow-xl">
            What You Can Do
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {infoCards.map((c, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.06, y: -6 }}
                className="p-10 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_0_50px_rgba(59,130,246,0.15)] group transition-all cursor-pointer"
              >
                <div className="text-5xl mb-6 text-blue-300 drop-shadow-lg">{c.icon}</div>
                <h3 className="text-3xl font-semibold text-white mb-4">{c.title}</h3>
                <p className="text-white/60 text-lg">{c.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </FadeInSection>


      <CompanyTypesSlider />

      {/* HOW IT WORKS */}
      <FadeInSection>
        <section className="py-28 max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center text-white mb-24 drop-shadow-xl">
            How It Works
          </h2>

          <div className="flex flex-col md:flex-row justify-center gap-14 text-center">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.08, y: -8 }}
                className="flex flex-col items-center p-10 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl transition-all"
              >
                <div className="w-24 h-24 bg-blue-500/20 text-blue-300 text-5xl flex items-center justify-center rounded-full mb-6">
                  {s.icon}
                </div>
                <h3 className="text-3xl text-white font-bold mb-3">{s.title}</h3>
                <p className="text-white/60 text-lg">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* REVIEWS */}
      <FadeInSection>
        <section className="py-28 max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center text-white mb-20 drop-shadow-xl">
            User Reviews
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {reviews.map((r, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl transition-all"
              >
                <div className="flex items-center gap-6 mb-6">
                  <div className="text-4xl text-white">{r.icon}</div>
                  <div>
                    <p className="text-white font-semibold text-xl">{r.name}</p>
                    <div className="text-yellow-300 text-lg">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-white/70 text-lg">{r.text}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </FadeInSection>

      {children}
    </main>
  );
}

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useAnimation, useInView } from "framer-motion";
import Lenis from "@studio-freight/lenis";

import CompanyTypesSlider from "@/components/dashboard/CompanyTypesSlider";
import { FaHistory } from "react-icons/fa";
import { MdEventAvailable } from "react-icons/md";
import { RiAdminFill } from "react-icons/ri";


type InfoCard = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

type Step = {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

type Review = {
  name: string;
  photo: string;
  rating: number;
  text: string;
};

/* ============================
   FadeInSection - reusable
   ============================ */
const FadeInSection: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 80 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.9 } },
      }}
    >
      {children}
    </motion.div>
  );
};

/* ============================
   Main Page Component
   ============================ */
export default function HomePage({ children }: { children?: React.ReactNode }): JSX.Element {
  const heroRef = useRef<HTMLDivElement | null>(null);

  // mouse used for subtle parallax; avoid frequent re-renders
  const [mouse, setMouse] = useState({ x: 0, y: 0 }); // used in styles
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 }); // latest pointer (no rerenders)
  const tickingRef = useRef<boolean>(false); // raf throttle

  const [slottoText, setSlottoText] = useState<string>("");
  const [showCursor, setShowCursor] = useState<boolean>(true);

  /* ----------------------------
     Lenis (smooth scroll)
     ---------------------------- */
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1 });

    let rafId = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      if (typeof (lenis as any).destroy === "function") (lenis as any).destroy();
    };
  }, []);

  /* ----------------------------
     Typing effect for "Slotto"
     ---------------------------- */
  useEffect(() => {
    const fullText = "Slotto";
    let index = 0;
    const id = setInterval(() => {
      setSlottoText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) {
        clearInterval(id);
        setTimeout(() => setShowCursor(false), 150);
      }
    }, 200);
    return () => clearInterval(id);
  }, []);

  /* ----------------------------
     Mouse handling (throttled via requestAnimationFrame)
     - We update mouseRef on each event (cheap)
     - We schedule a single RAF to copy the ref into state (causes re-render at most 60fps)
     ---------------------------- */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (!rect) return;
      // store in ref (no re-render)
      mouseRef.current = {
        x: (e.clientX - rect.left - rect.width / 2) / 50,
        y: (e.clientY - rect.top - rect.height / 2) / 50,
      };

      // schedule RAF if not already scheduled
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(() => {
          setMouse({ ...mouseRef.current });
          tickingRef.current = false;
        });
      }
    };

    const el = heroRef.current ?? window;
    el.addEventListener("mousemove", onMove);

    return () => {
      el.removeEventListener("mousemove", onMove);
    };
  }, []);

  /* ----------------------------
     Data (memoized)
     ---------------------------- */
  const infoCards: InfoCard[] = useMemo(
    () => [
      { title: "Easy Booking", description: "Quickly reserve your spot.", icon: <MdEventAvailable /> },
      { title: "Booking History", description: "Track all your past bookings.", icon: <FaHistory /> },
      { title: "Admin Management", description: "Manage the system effortlessly.", icon: <RiAdminFill /> },
    ],
    []
  );

  const steps: Step[] = useMemo(
    () => [
      {
        number: "01",
        title: "Search",
        description: "Find exactly what you need with intelligent filters and realtime availability.",
        icon: (
          <svg className="kit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        number: "02",
        title: "Book",
        description: "Reserve instantly with a fast and seamless booking experience.",
        icon: (
          <svg className="kit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 10h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 4v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        number: "03",
        title: "Enjoy",
        description: "Relax and receive instant confirmation — everything is automated for you.",
        icon: (
          <svg className="kit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
    ],
    []
  );

  const reviews: Review[] = useMemo(
    () => [
      {
        name: "Anna Petrova",
        photo: "/reviews/anna.jpg",
        rating: 5,
        text: "Slotto completely transformed how I manage bookings. Clean interface, fast confirmation, and a futuristic feel. It saves me time every single day!",
      },
      {
        name: "Ivan Kovalenko",
        photo: "/reviews/ivan.jpg",
        rating: 4,
        text: "Beautiful design, smooth animations, and very easy to use. It feels like the future of booking systems.",
      },
      {
        name: "Maria Shevchenko",
        photo: "/reviews/maria.jpg",
        rating: 5,
        text: "Everything is intuitive and quick! I love the modern design and trust the system completely. Amazing work!",
      },
    ],
    []
  );

  /* ----------------------------
     Render
     ---------------------------- */
  return (
    <main className="relative w-full overflow-hidden  text-white">
      {/* HERO */}
      <section
        ref={heroRef}
        className="relative min-h-[110vh] flex flex-col items-center justify-center text-center px-6"
      >
        {/* subtle parallax background (uses state 'mouse' but updates are throttled) */}
        <motion.div
          style={{ x: mouse.x * -15, y: mouse.y * -15 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_70%)] pointer-events-none"
        />

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-7xl sm:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 drop-shadow-lg"
        >
          {slottoText}
          {showCursor && <span className="blinking-cursor">|</span>}
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="mt-3 max-w-2xl text-xl font-semibold">
          powered by{" "}
          <span className="font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 bg-clip-text text-transparent">
            OKANO
          </span>
        </motion.p>

        <motion.p initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl sm:text-2xl text-white/70 mt-8 max-w-3xl">
          A futuristic way to book, manage, and explore services in the digital cosmos.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex gap-6 mt-14">
          <Link href="/login" className="px-10 py-4 bg-blue-600 rounded-2xl shadow-xl hover:scale-105">
            Try Now
          </Link>
          <Link href="/contact" className="px-10 py-4 bg-white/5 border border-white/20 rounded-2xl hover:scale-105">
            Contact Us
          </Link>
        </motion.div>

        <div className="absolute bottom-14 text-white/50 text-xl animate-bounce tracking-widest">SCROLL ↓</div>
      </section>

      {/* INFO CARDS */}
      <FadeInSection>
        <section className="py-28 max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-20">What You Can Do</h2>

          <div className="grid md:grid-cols-3 gap-12">
            {infoCards.map((c) => (
              <motion.div key={c.title} whileHover={{ scale: 1.06, y: -6 }} className="p-10 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl">
                <div className="text-5xl mb-6 text-blue-300">{c.icon}</div>
                <h3 className="text-3xl font-semibold mb-4">{c.title}</h3>
                <p className="text-white/60 text-lg">{c.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </FadeInSection>

      <CompanyTypesSlider />

      {/* HOW IT WORKS (simplified, stable) */}
      <FadeInSection>
        <section className="py-28 max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-24">How It Works</h2>

          <div className="relative flex flex-col items-center mx-auto max-w-3xl animate-fade-up">
            {/* static vertical line behind cards */}
            <div className="absolute left-1/2 -translate-x-1/2 top-6 bottom-6 w-[4px] bg-gradient-to-b from-blue-500/60 via-purple-500/60 to-pink-500/60 rounded-full pointer-events-none" />

            {steps.map((s) => (
              <div key={s.number} className="w-full flex justify-center mb-14 relative">
                <div className="w-full max-w-lg p-8 rounded-3xl bg-white/6 backdrop-blur-md border border-white/10 shadow-md relative z-10 flex flex-col items-center">
                  <div className="absolute left-[-44px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg" />
                  <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">{s.number}</div>
                  <div className="mx-auto mb-4">{s.icon}</div>
                  <h3 className="text-2xl font-semibold text-center mb-2">{s.title}</h3>
                  <p className="text-white/70 text-lg text-center">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* USER REVIEWS */}
      <FadeInSection>
        <section className="py-28 max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-20">User Reviews</h2>

          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}>
            {reviews.map((r) => (
              <motion.div key={r.name} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }} whileHover={{ scale: 1.06, y: -10 }} className="relative p-10 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-xl overflow-hidden">
                {/* soft glow */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-20 -left-20 w-60 h-60 bg-pink-500/20 blur-3xl" />
                  <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/20 blur-3xl" />
                </div>

                <div className="absolute inset-0 rounded-3xl border border-white/10 animate-pulse" />

                <div className="flex items-center gap-6 mb-6 relative z-10">
                  <div className="w-20 h-20 rounded-full overflow-hidden shadow-xl relative">
                    <Image src={r.photo} alt={r.name} width={80} height={80} objectFit="cover" />
                  </div>

                  <div>
                    <p className="text-2xl font-semibold">{r.name}</p>
                    <div className="text-yellow-300 text-lg tracking-widest">{Array.from({ length: r.rating }).map((_, i) => "★").join("")}
                      <span className="opacity-40">{Array.from({ length: 5 - r.rating }).map(() => "★").join("")}</span>
                    </div>
                  </div>
                </div>

                <p className="text-white/80 text-lg leading-relaxed relative z-10">{r.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </FadeInSection>

      {children}
    </main>
  );
}

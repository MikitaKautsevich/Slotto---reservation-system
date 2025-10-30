"use client";

import { useState } from "react";
import Link from "next/link";
import { Geist } from "next/font/google";
import "./globals.css";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaHistory } from "react-icons/fa";
import { IoPerson } from "react-icons/io5";
import { RiAdminFill } from "react-icons/ri";
import { Navigation } from "swiper/modules";
import { FaSearch } from "react-icons/fa";
import { MdEventAvailable } from "react-icons/md";
import { FaRegSmileBeam } from "react-icons/fa";



const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.15)" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });

  const infoCards = [
    { title: "Easy Booking", description: "Quickly reserve your spot without any hassle.", icon: <MdEventAvailable/> },
    { title: "Booking History", description: "Keep track of all your past bookings in one place.", icon: <FaHistory/> },
    { title: "Admin Management", description: "Manage your system easily with our intuitive interface.", icon: <RiAdminFill/> },
  ];

    const steps = [
    { title: "Search", description: "Find the service or professional you need.", image: <FaSearch /> },
    { title: "Book", description: "Reserve your spot in just a few clicks.", image: <MdEventAvailable /> },
    { title: "Enjoy", description: "Receive confirmation and enjoy the service hassle-free.", image: <FaRegSmileBeam /> },
  ];


  const reviews = [
    {
      name: "Anna P.",
      photo: <IoPerson/>,
      rating: 5,
      text: "The service is super convenient! I booked my spot quickly and got instant confirmation.",
    },
    {
      name: "Ivan K.",
      photo: <IoPerson/>,
      rating: 4,
      text: "I really liked the design and simplicity of use.",
    },
    {
      name: "Maria S.",
      photo: <IoPerson/>,
      rating: 5,
      text: "Excellent service! Highly recommended.",
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", email: "", message: "" };
    if (!form.name) { newErrors.name = "Name is required"; valid = false; }
    if (!form.email) { newErrors.email = "Email is required"; valid = false; }
    else if (!/\S+@\S+\.\S+/.test(form.email)) { newErrors.email = "Email is invalid"; valid = false; }
    if (!form.message) { newErrors.message = "Message is required"; valid = false; }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log("Form submitted:", form);
      setForm({ name: "", email: "", message: "" });
    }
  };

  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center bg-gradient-to-b from-blue-100 to-white rounded-2xl">
<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1 }}
  className="max-w-2xl px-4 text-center"
>
  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-blue-900 mb-8">
    Welcome to
  </h1>
  <Link href="/" className="flex items-center gap-3 justify-center">
    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-extrabold shadow-lg">
      ST
    </div>
    <span className="text-3xl font-bold text-gray-900 tracking-tight">Slotto</span>
  </Link>

  <p className="text-base sm:text-lg md:text-xl my-8 font-bold text-gray-800">
    Book, manage and track your reservations all in one place.
  </p>

  <div className="flex flex-col sm:flex-row justify-center gap-4">
    <a
      href="/login"
      className="px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg transform transition hover:scale-105 hover:bg-blue-700"
    >
      Try it
    </a>
    <a
      href="/contact"
      className="px-6 py-3 sm:px-8 sm:py-4 bg-white border border-gray-300 text-gray-800 font-semibold rounded-xl shadow hover:scale-105 hover:bg-gray-100 transition"
    >
      Contact Us
    </a>
  </div>
</motion.div>

        <div className="absolute bottom-6 animate-bounce text-blue-800 font-bold">
          ↓ Scroll
        </div>
      </section>

      {/* Info Section */}
      <motion.section
        className="py-20 space-y-10 max-w-6xl mx-auto px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <h2 className="text-3xl font-bold text-center">What You Can Do With Our Service</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {infoCards.map((card, idx) => (
            <motion.div key={idx} variants={cardVariants} whileHover="hover">
              <Card className="p-6 cursor-pointer transition-all">
                <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">{card.title}</h3>
                <div className="">{card.icon}</div>
                </div>
                <p className="text-gray-700">{card.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

            {/* How it Works */}
      {/* <motion.section className="py-20 bg-gray-50" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
          {steps.map((step, idx) => (
            <Card key={idx} className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <div className="text-4xl font-bold text-blue-600 mb-4">{idx + 1}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-700">{step.description}</p>
            </Card>
          ))}
        </div>
      </motion.section> */}

      {/* How it Works Section */}
      <motion.section
        className="py-20 bg-gradient-to-b from-blue-50 to-white"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>

        <div className="relative max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center relative">
              {/* Step Icon/Image */}
              <div className="w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full mb-4 shadow-lg">
                {step.image}
              </div>

              {/* Step Number */}
              <div className="text-3xl font-bold text-blue-600 mb-2">{idx + 1}</div>

              {/* Step Title */}
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>

              {/* Step Description */}
              <p className="text-gray-700 max-w-sm">{step.description}</p>

              {/* Arrow (кроме последнего шага) */}
              {idx < steps.length - 1 && (
                <div className="hidden sm:block absolute right-[-60px] top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-12 h-12 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      {/* Reviews Section */}
      <motion.section
        className="py-20 max-w-6xl mx-auto px-6"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold text-center mb-10">User Reviews</h2>
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {reviews.map((rev, idx) => (
            <SwiperSlide key={idx}>
              <Card className="p-6 flex flex-col items-start gap-4 cursor-pointer transition-all h-50">
                <div className="flex items-center gap-3">
                  <div className="">
                    {rev.photo}
                    </div>
                  <div>
                    <p className="font-semibold">{rev.name}</p>
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < rev.rating ? "★" : "☆"}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">{rev.text}</p>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.section>
      {/* Footer */}
      <footer className="mt-20 bg-gradient-to-b from-blue-100 to-blue-200 text-gray-800 py-12 px-6 rounded-t-3xl">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md">
                ST
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">Slotto</span>
            </div>
            <p className="text-gray-700 text-sm">
              Book, manage, and track your reservations seamlessly — anytime, anywhere.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-blue-700 transition">Home</Link></li>
              <li><Link href="/about" className="hover:text-blue-700 transition">About</Link></li>
              <li><Link href="/contact" className="hover:text-blue-700 transition">Contact</Link></li>
              <li><Link href="/login" className="hover:text-blue-700 transition">Login</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="hover:text-blue-700 transition">FAQ</Link></li>
              <li><Link href="/help" className="hover:text-blue-700 transition">Help Center</Link></li>
              <li><Link href="/terms" className="hover:text-blue-700 transition">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-700 transition">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Stay Updated</h3>
            <p className="text-sm text-gray-700 mb-4">
              Get the latest news and exclusive offers.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-300 mt-10 pt-6 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Slotto. All rights reserved.</p>
          <div className="mt-3 flex justify-center gap-4 text-xl">
            <a href="#" className="hover:text-blue-600 transition"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="hover:text-blue-600 transition"><i className="fab fa-twitter"></i></a>
            <a href="#" className="hover:text-blue-600 transition"><i className="fab fa-instagram"></i></a>
            <a href="#" className="hover:text-blue-600 transition"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
      </footer>
    </main>
  );
}
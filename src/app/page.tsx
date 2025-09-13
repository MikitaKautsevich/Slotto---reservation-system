"use client";

import { useState } from "react";
import Link from "next/link";
import { Geist } from "next/font/google";
import "./globals.css";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Image from "next/image";

import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { FaHistory } from "react-icons/fa";
import { IoPerson } from "react-icons/io5";
import { RiAdminFill } from "react-icons/ri";
import { MdEventAvailable } from "react-icons/md";





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

  <div className="flex justify-center items-center">
    <Image
      src="/logo.png"
      alt="Slotto Logo"
      width={250}
      height={80}
      className="h-auto object-contain sm:w-64 md:w-72 lg:w-80"
      priority
    />
  </div>

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

      {/* Contact Section */}
      <motion.section
        className="py-20 bg-gray-50"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold text-center mb-10">Contact Us</h2>
        <div className="max-w-lg mx-auto space-y-4">
          <Input
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          <Input
            name="email"
            placeholder="Your Email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          <textarea
            name="message"
            placeholder="Message"
            className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.message}
            onChange={handleChange}
          />
          {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
          <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-700 transition"
            onClick={handleSubmit}
          >
            Send Message
          </Button>
        </div>
      </motion.section>
    </main>
  );
}

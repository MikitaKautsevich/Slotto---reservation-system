"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "./layout/Header";
import Footer from "./layout/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#030617] text-gray-900 font-sans antialiased`}
      >
        <AuthProvider>
          <Header />
          <main className="mx-auto max-w-8xl px-6 pt-20">
            {children}
          </main>
         <Footer/>
        </AuthProvider>
      </body>
    </html>
  );
}

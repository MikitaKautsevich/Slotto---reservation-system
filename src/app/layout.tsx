"use client";

import { useState } from "react";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { getAuth, signOut } from "firebase/auth";
import { FaRegUserCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";



const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", visible: user },
    { name: "Price List", href: "/priceList", visible: true },
    { name: "Contact", href: "/contact", visible: true },
  ];

  const signOutUser = () => {
  const auth = getAuth();
  signOut(auth).then(() => {
    console.log("Sing out")
    router.push("/")
  }).catch((error) => {
    console.log(error)
  });
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="mx-auto flex justify-between items-center p-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              ST
            </div>
            <span className="text-2xl font-bold text-blue-900">Slotto</span>
          </Link>

          {/* Десктопное меню */}
          <div className="hidden md:flex gap-4">
            {menuItems.filter(item => item.visible).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xl px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Иконки + Login */}
        <div className="hidden md:flex gap-4 items-center">
          {!user ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
              >
                Try it for free
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
              >
                Login
              </Link>
            </>
          ) : (
            <>
              <span
                style={{ cursor: "pointer" }}
                onClick={() => router.push("/profile")}
              >
                <FaRegUserCircle size={30} />
              </span>
              <button
                onClick={signOutUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
              >
                Log out
              </button>
            </>

          )}
        </div>

        {/* Мобильный бургер */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </nav>

      {/* Мобильное меню */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-6 py-3 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/login"
            className="block px-6 py-3 bg-blue-600 text-white text-center rounded-b-lg hover:bg-blue-700"
            onClick={() => setMenuOpen(false)}
          >
            {user ? "Profile" : "Login"}
          </Link>
        </div>
      )}
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 text-gray-900 font-sans`}>
        <AuthProvider>
          <Header />
          <main className="mx-auto p-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

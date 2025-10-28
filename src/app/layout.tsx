"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { getAuth, signOut } from "firebase/auth";
import { FaRegUserCircle } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // для определения активного пункта

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user?.uid) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserRole(data.role || null);
        }
      }
    };
    fetchUserRole();
  }, [user]);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", visible: userRole === "user" },
    { name: "Dashboard", href: "/company/dashboard", visible: userRole === "companyAdmin" },
    { name: "Price List", href: "/priceList", visible: true },
    { name: "Contact", href: "/contact", visible: true },
  ];

  const signOutUser = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setUserRole(null);
        router.push("/");
      })
      .catch(console.log);
  };

  return (
    <header className="backdrop-blur-md bg-white/80 border-b border-gray-200 sticky top-0 z-50 shadow-md">
      <nav className="mx-auto flex justify-between items-center px-8 py-4 max-w-8xl font-sans">
        {/* Логотип */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-extrabold shadow-lg">
            ST
          </div>
          <span className="text-3xl font-bold text-gray-900 tracking-tight">Slotto</span>
        </Link>

        {/* Десктопное меню */}
        <div className="hidden md:flex gap-4 lg:gap-6 ml-12">
          {menuItems.filter(item => item.visible).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-lg px-6 py-3 rounded-xl transition-all duration-300
                  ${isActive ? "text-white bg-blue-600 shadow-md" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}
                `}
              >
                {item.name}
                {!isActive && (
                  <span className="absolute bottom-2 left-0 w-0 h-[3px] bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Иконки + Login */}
        <div className="hidden md:flex gap-5 items-center">
          {!user ? (
            <>
              <Link
                href="/company/register"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                Add Company
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                Login
              </Link>
            </>
          ) : (
            <>
              <span
                className="cursor-pointer text-gray-600 hover:text-blue-600 transition-all duration-300"
                onClick={() => router.push("/profile")}
              >
                <FaRegUserCircle size={36} />
              </span>
              <Link
                href="/company/register"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                Add Company
              </Link>
              <button
                onClick={signOutUser}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                Log out
              </button>
            </>
          )}
        </div>

        {/* Мобильный бургер */}
        <button
          className="md:hidden p-3 rounded-lg hover:bg-gray-100 transition-all duration-300"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-8 h-8 text-gray-800"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
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
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg">
          {menuItems.filter(item => item.visible).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-8 py-4 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-all duration-300"
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href={user ? "/profile" : "/login"}
            className="block mx-8 my-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 text-gray-900 font-sans antialiased`}
      >
        <AuthProvider>
          <Header />
          <main className="mx-auto max-w-8xl px-6 py-6">
            {/* Welcome блок с логотипом ST */}
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

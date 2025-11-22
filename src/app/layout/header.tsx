"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FaRegUserCircle, FaBars, FaTimes, FaMapMarkerAlt } from "react-icons/fa";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export const Header = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [city, setCity] = useState<string | null>(null);
  const [geoError, setGeoError] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user?.uid) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role || null);
        }
      }
    };
    fetchUserRole();
  }, [user]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Convert country code to emoji flag
  const countryCodeToFlagEmoji = (countryCode: string) => {
    return countryCode
      .toUpperCase()
      .replace(/./g, (char) =>
        String.fromCodePoint(127397 + char.charCodeAt(0))
      );
  };

  // Get user location (city + country + flag) + fallback IP
  useEffect(() => {
    async function fetchReverseGeo(lat: number, lon: number) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
        );
        const data = await res.json();
        const cityName =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.hamlet ||
          null;
        const countryName = data.address.country || null;
        const countryCode = data.address.country_code?.toUpperCase() || null;

        if (countryName && countryCode) {
          const flag = countryCodeToFlagEmoji(countryCode);
          if (cityName) setCity(`${cityName}, ${countryName} ${flag}`);
          else setCity(`${countryName} ${flag}`);
        } else {
          setCity("Unknown");
        }
      } catch (err) {
        console.error("Reverse geocoding error:", err);
        setCity("Unknown");
      }
    }

    if (!("geolocation" in navigator)) {
      setGeoError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchReverseGeo(latitude, longitude);
      },
      async () => {
        // fallback IP geolocation
        try {
          const res = await fetch("https://ipapi.co/json/");
          const ipData = await res.json();
          if (ipData?.latitude && ipData?.longitude) {
            fetchReverseGeo(ipData.latitude, ipData.longitude);
          } else {
            setGeoError(true);
          }
        } catch {
          setGeoError(true);
        }
      },
      { timeout: 5000 }
    );
  }, []);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", visible: true },
    { name: "Company", href: "/company/dashboard", visible: userRole === "companyAdmin" },
    { name: "Contact", href: "/contact", visible: true },
  ];

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setUserRole(null);
        router.push("/");
      })
      .catch(console.error);
  };

  const bgOpacity = Math.min(0.9, 0.3 + scrollY / 600);
  const backdropBlur = scrollY > 50 ? "backdrop-blur-md" : "backdrop-blur-sm";

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-white/5"
      style={{ backgroundColor: `rgba(3,6,23,${bgOpacity})` }}
    >
      <nav className={`max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 py-4 ${backdropBlur}`}>

        {/* Logo + Location */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-bold text-lg shadow-md transition-transform hover:scale-110">
              ST
            </div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 font-bold text-2xl tracking-wide">
              Slotto
            </span>
          </Link>

          {/* Location badge */}
          <div className="flex items-center gap-2 text-white text-sm font-medium bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all">
            <FaMapMarkerAlt className="text-red-400 text-sm" />
            {geoError ? (
              <span>Give access to location</span>
            ) : city ? (
              <span>{city}</span>
            ) : (
              <span className="animate-pulse text-white/50">Detecting…</span>
            )}
          </div>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          {menuItems.filter(i => i.visible).map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <div key={item.href} className="flex items-center">
                {index !== 0 && <div className="w-px h-5 bg-white/10 mx-3"></div>}
                <Link href={item.href}>
                  <span className={`relative text-white/80 font-medium tracking-wide text-base transition-all duration-300 cursor-pointer hover:text-white`}>
                    {item.name}
                    <span className={`absolute left-0 -bottom-1 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all ${isActive ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full"}`}></span>
                  </span>
                </Link>
              </div>
            )
          })}

          {user ? (
            <FaRegUserCircle
              size={28}
              onClick={() => router.push("/profile")}
              className="text-white/80 hover:text-white cursor-pointer transition-all hover:scale-110"
            />
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-white border border-white/20 rounded-xl hover:bg-white/10 shadow-sm transition-all"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white text-3xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-[#030617]/95 backdrop-blur-xl border-t border-white/10 flex flex-col items-center py-6 space-y-4 animate-[fadeIn_0.3s_ease]">
          {menuItems.filter(i => i.visible).map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-white/90 text-xl font-semibold tracking-wide hover:text-blue-400 transition-colors"
            >
              {item.name}
            </Link>
          ))}

          {user ? (
            <button
              onClick={handleSignOut}
              className="px-6 py-2 text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="px-6 py-2 text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

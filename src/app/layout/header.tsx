import { useState, useEffect } from "react";
import Link from "next/link";
import "../globals.css";
import { getAuth, signOut } from "firebase/auth";
import { FaRegUserCircle } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export const Header = () => {

  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
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
    { name: "Dashboard", href: "/dashboard", visible: true },
    { name: "Company", href: "/company/dashboard", visible: userRole === "companyAdmin" },
    { name: "Price List", href: "/priceList", visible: true },
    { name: "Contact", href: "/contact", visible: true },
  ];

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setUserRole(null);
        router.push("/");
      })
      .catch(console.log)
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
      <nav className="mx-auto flex max-w-8xl items-center justify-between px-6 lg:px-10 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform">
            ST
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-blue-700 transition-colors">
            Slotto
          </span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-1 lg:gap-3 ml-8">
          {menuItems.filter(i => i.visible).map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-2 rounded-xl text-base font-medium transition-all duration-300
                  ${isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
      <div className="hidden md:flex items-center gap-4">
  {!user ? (
    <>
      <Link
        href="/company/register"
        className="relative inline-flex items-center justify-center px-5 py-2.5 overflow-hidden font-medium text-white rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 shadow-md hover:scale-[1.03] hover:shadow-lg transition-all duration-300 group"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        <span className="relative">Add Company</span>
      </Link>

      <Link
        href="/login"
        className="relative inline-flex items-center justify-center px-5 py-2.5 overflow-hidden font-medium text-white rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-indigo-700 shadow-md hover:scale-[1.03] hover:shadow-lg transition-all duration-300 group"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        <span className="relative">Login</span>
      </Link>
    </>
  ) : (
    <>
      <FaRegUserCircle
        size={34}
        onClick={() => router.push("/profile")}
        className="cursor-pointer text-gray-600 hover:text-blue-600 transition-colors"
      />

      <Link
        href="/company/register"
        className="relative inline-flex items-center justify-center px-5 py-2.5 overflow-hidden font-medium text-white rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 shadow-md hover:scale-[1.03] hover:shadow-lg transition-all duration-300 group"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        <span className="relative">Add Company</span>
      </Link>

      <button
        onClick={handleSignOut}
        className="relative inline-flex items-center justify-center px-5 py-2.5 overflow-hidden font-medium text-white rounded-xl bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 shadow-md hover:scale-[1.03] hover:shadow-lg transition-all duration-300 group"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-orange-400 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        <span className="relative">Log out</span>
      </button>
    </>
  )}
      </div>

        {/* Mobile burger */}
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md shadow-lg animate-fade-in">
          {menuItems.filter(i => i.visible).map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block px-8 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
            >
              {item.name}
            </Link>
          ))}

          {user ? (
            <button
              onClick={handleSignOut}
              className="block mx-8 my-4 w-[calc(100%-4rem)] px-6 py-3 text-white text-center rounded-xl bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 shadow-md hover:scale-[1.03] hover:shadow-lg transition-all duration-300"
            >
              Log out
            </button>
          ) : (
            <Link
              href="/login"
              className="block mx-8 my-4 w-[calc(100%-4rem)] px-6 py-3 text-white text-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-indigo-700 shadow-md hover:scale-[1.03] hover:shadow-lg transition-all duration-300"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

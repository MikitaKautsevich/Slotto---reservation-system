"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

import CompanyInfoTab from "@/components/company/CompanyInfoTab";
import CompanyServicesTab from "@/components/company/CompanyServicesTab";
import CompanyEmployeesTab from "@/components/company/CompanyEmployeesTab";
import CompanyReservations from "@/components/company/CompanyReservations";

enum Tab {
  Info = "Company Info",
  Services = "Services",
  Employees = "Employees",
  Reservations = "Reservations",
}

export default function CompanyDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Info);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "companies"),
          where("ownerId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const data: any[] = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
        setCompanies(data);

        if (data.length > 0) setSelectedCompany(data[0]);
      } catch (err) {
        console.error("Error loading companies:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    if (!selectedCompany) return null;
    switch (activeTab) {
      case Tab.Info:
        return <CompanyInfoTab companyId={selectedCompany.id} />;
      case Tab.Services:
        return <CompanyServicesTab companyId={selectedCompany.id} />;
      case Tab.Employees:
        return <CompanyEmployeesTab companyId={selectedCompany.id} />;
      case Tab.Reservations:
        return <CompanyReservations companyId={selectedCompany.id} />;
      default:
        return null;
    }
  };

  if (loading)
    return <p className="text-gray-500 text-center mt-10">Loading dashboard...</p>;
  if (!user)
    return <p className="text-red-500 text-center mt-10">Please log in to view your dashboard.</p>;
  if (companies.length === 0)
    return <p className="text-gray-500 text-center mt-10">You don’t have any companies yet.</p>;

  return (
    <div className="flex h-150 ">
      {/* Десктопное боковое меню */}
      <nav className="hidden md:flex flex-col w-54 p-6 bg-white rounded-r-2xl shadow-md space-y-4">
        <h1 className="text-2xl font-bold mb-6">Company Dashboard</h1>
        {companies.length > 1 && (
          <select
            value={selectedCompany?.id || ""}
            onChange={(e) => {
              const comp = companies.find((c) => c.id === e.target.value);
              setSelectedCompany(comp);
            }}
            className="w-full border rounded-lg px-3 py-2 mb-4"
          >
            {companies.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name || "Unnamed Company"}
              </option>
            ))}
          </select>
        )}
        {Object.values(Tab).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-left px-4 py-2 rounded-lg font-medium transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Мобильное меню */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-30 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              className="fixed top-0 left-0 h-full w-64 bg-white shadow-md z-40 p-6 flex flex-col space-y-4"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <button onClick={() => setMenuOpen(false)} className="p-2">
                  <svg
                    className="w-6 h-6 text-gray-800"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {companies.length > 1 && (
                <select
                  value={selectedCompany?.id || ""}
                  onChange={(e) => {
                    const comp = companies.find((c) => c.id === e.target.value);
                    setSelectedCompany(comp);
                  }}
                  className="w-full border rounded-lg px-3 py-2 mb-4"
                >
                  {companies.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name || "Unnamed Company"}
                    </option>
                  ))}
                </select>
              )}
              {Object.values(Tab).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setMenuOpen(false);
                  }}
                  className={`text-left px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Контент */}
      <div className="flex-1 flex flex-col">
        {/* Мобильная верхняя панель */}
        <div className="md:hidden flex items-center justify-between bg-white shadow-md p-4 sticky top-0 z-20">
          <h1 className="text-xl font-bold">Company Dashboard</h1>
          <button onClick={() => setMenuOpen(true)} className="p-2">
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <main className="flex-1 px-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (selectedCompany?.id || "")}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

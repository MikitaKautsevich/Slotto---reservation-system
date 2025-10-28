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
import { Company } from "@/types/company";

enum Tab {
  Info = "Overview",
  Services = "Services",
  Employees = "Employees",
  Reservations = "Reservations",
}

export default function CompanyDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Info);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
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
        const data: Company[] = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Company));
        setCompanies(data);
        if (data.length > 0) setSelectedCompany(data[0]);
      } catch (err) {
        console.error("Error loading companies:", err);
      } finally {
        setTimeout(() => setLoading(false), 1000); // мягкая задержка загрузки
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

  // Skeleton Loader
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-3 animate-pulse text-center">
          <div className="h-6 bg-gray-300 rounded w-48 mx-auto" />
          <div className="h-4 bg-gray-300 rounded w-64 mx-auto" />
        </div>
      </div>
    );

  if (!user)
    return <p className="text-red-500 text-center mt-10">Please log in to view your dashboard.</p>;
  if (companies.length === 0)
    return <p className="text-gray-500 text-center mt-10">You don’t have any companies yet.</p>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex flex-col w-64 p-6 bg-white border-r border-gray-200 shadow-sm"
      >
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {companies.length > 1 && (
          <select
            value={selectedCompany?.id || ""}
            onChange={(e) => {
              const comp = companies.find((c) => c.id === e.target.value);
              setSelectedCompany(comp ?? null);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-5 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {companies.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name || "Unnamed Company"}
              </option>
            ))}
          </select>
        )}

        <div className="space-y-2">
          {Object.values(Tab).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all duration-150 ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </motion.aside>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 p-6 flex flex-col space-y-4"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Dashboard</h1>
                <button onClick={() => setMenuOpen(false)}>
                  <svg
                    className="w-6 h-6 text-gray-700"
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
                    setSelectedCompany(comp ?? null);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
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
                  className={`text-left px-4 py-2 rounded-lg font-medium transition-all duration-150 ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between bg-white shadow-sm p-4 sticky top-0 z-20 border-b">
          <h1 className="text-lg font-bold">{selectedCompany?.name || "Company Dashboard"}</h1>
          <button onClick={() => setMenuOpen(true)}>
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Animated Tab Content */}
        <main className="flex-1 p-6 md:p-10">
          <motion.div
            key={activeTab + (selectedCompany?.id || "")}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="bg-white rounded-2xl shadow-md p-6 md:p-8"
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

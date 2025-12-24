"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

import CompanyInfoTab from "@/components/company/CompanyInfoTab";
import { ServicesTab } from "@/components/company/services/ServicesTab";
import { EmployeesTab } from "@/components/company/employeers/EmployeesTab";
import CompanyReservations from "@/components/company/CompanyReservations";
import { Company } from "@/types/company";
import Select from "@/components/custom/Select";
import { CompanyDashboardSkeleton } from "../../../components/company/CompanyDashboardSkeleton";
import { InfoMessage } from "@/components/custom/InfoMessage";

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
        setTimeout(() => setLoading(false), 1000);
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
        return <ServicesTab companyId={selectedCompany.id} />;
      case Tab.Employees:
        return <EmployeesTab companyId={selectedCompany.id} />;
      case Tab.Reservations:
        return <CompanyReservations companyId={selectedCompany.id} />;
      default:
        return null;
    }
  };

  if (loading) return <CompanyDashboardSkeleton />;

  if (!user)
    return (
      <InfoMessage
        type="info"
        title="Not Logged In"
        message="Please log in to view your dashboard"
      />
    );

  if (companies.length === 0)
    return (
      <InfoMessage
        type="info"
        title="Companies Not Found"
        message="You don’t have any companies yet."
      />
    );

  return (
    <div className="flex min-h-screen bg-[#030617] text-gray-200">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex flex-col w-64 p-6 border-r border-gray-700 bg-[#0a0f25] shadow-none"
      >
        <h1 className="text-2xl font-bold mb-6 text-white">Dashboard</h1>

        {companies.length > 1 && (
          <Select
            value={selectedCompany?.name || ""}
            onChange={(e) => {
              const comp = companies.find((c) => c.name === e.target.value);
              setSelectedCompany(comp ?? null);
            }}
            options={companies.map((comp) => comp.name || "Unnamed Company")}
          />
        )}

        <div className="space-y-2 mt-6">
          {Object.values(Tab).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all duration-150 ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-[#1a1f35]"
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
              className="fixed inset-0 bg-black bg-opacity-50 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              className="fixed top-0 left-0 h-full w-64 shadow-xl z-40 p-6 flex flex-col space-y-4 bg-[#0a0f25] border-r border-gray-700"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-white">Dashboard</h1>
                <button onClick={() => setMenuOpen(false)}>
                  <svg
                    className="w-6 h-6 text-gray-400 hover:text-white"
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
                  className="w-full border border-gray-700 rounded-lg px-3 py-2 mb-4 bg-[#030617] text-gray-200"
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
                      : "text-gray-400 hover:bg-[#1a1f35]"
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
        <div className="md:hidden flex items-center justify-between p-4 sticky top-0 z-20 border-b border-gray-700 bg-[#0a0f25]">
          <h1 className="text-lg font-bold text-white">
            {selectedCompany?.name || "Company Dashboard"}
          </h1>
          <button onClick={() => setMenuOpen(true)}>
            <svg
              className="w-6 h-6 text-gray-400 hover:text-white"
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
        <main className="flex-1 px-6">
          <motion.div
            key={activeTab + (selectedCompany?.id || "")}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl bg-[#0a0f25] border border-gray-700 p-6 md:p-8 shadow-none"
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

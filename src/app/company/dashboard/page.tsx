"use client";

import CompanyInfoTab from "@/components/company/CompanyInfoTab";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Info:
        return <CompanyInfoTab />;
      case Tab.Services:
        return <CompanyServicesTab/>;
      case Tab.Employees:
        return <CompanyEmployeesTab />;
      case Tab.Reservations:
        return <CompanyReservations />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-100px)] bg-gray-100">
      {/* Navbar слева */}
      <nav className="w-64 p-6 bg-white rounded-xl shadow-md space-y-4 flex flex-col my-6 ml-6">
        <h1 className="text-2xl font-bold mb-6">Company Dashboard</h1>
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

      {/* Контент справа с анимацией */}
      <main className="flex-1 p-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

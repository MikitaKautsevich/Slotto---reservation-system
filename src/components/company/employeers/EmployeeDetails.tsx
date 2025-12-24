"use client";

import Image from "next/image";
import Button from "@/components/custom/Button";
import { Employee } from "@/types/employee";
import { Service } from "@/types/service";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaPhone, FaCalendarAlt, FaTimes } from "react-icons/fa";

export const EmployeeDetails = ({
  employee,
  services,
  onClose,
}: {
  employee: Employee;
  services: Service[];
  onClose: () => void;
}) => {
  if (!employee) return null;

  const employeeServices = services.filter((s) =>
    (employee.servicesIds || []).includes(s.id)
  );

  const isAvailable = Math.random() > 0.3;
  const joinedAt = new Date(employee.createdAt || Date.now()).toLocaleDateString();

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          key="modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="relative bg-[#0a0f25] border border-gray-700 rounded-2xl shadow-2xl shadow-blue-900/30 p-6 sm:p-8 w-full max-w-md text-gray-200"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
          >
            <FaTimes size={18} />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-blue-600/30 blur-md" />
              <Image
                src={employee.photoURL || "/placeholder.png"}
                alt={employee.name}
                width={96}
                height={96}
                className="rounded-full object-cover border-4 border-[#12182d] shadow-md relative z-10"
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold mt-4 text-white">
              {employee.name}
            </h2>
            <p className="text-gray-400 text-sm">{employee.position || "Employee"}</p>

            <div
              className={`mt-3 text-xs font-medium px-3 py-1 rounded-full ${
                isAvailable
                  ? "bg-green-900/30 text-green-400 border border-green-700"
                  : "bg-red-900/30 text-red-400 border border-red-700"
              }`}
            >
              {isAvailable ? "Available" : "Busy"}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 text-sm text-gray-400 mb-5">
            {employee.email && (
              <p className="flex items-center gap-2">
                <FaEnvelope className="text-gray-500" /> {employee.email}
              </p>
            )}
            {employee.phone && (
              <p className="flex items-center gap-2">
                <FaPhone className="text-gray-500" /> {employee.phone}
              </p>
            )}
            <p className="flex items-center gap-2 text-gray-500">
              <FaCalendarAlt className="text-gray-500" /> Joined on {joinedAt}
            </p>
          </div>

          {/* Services */}
          <div className="mb-5">
            <p className="font-semibold mb-3 text-gray-300 text-sm">
              Services they can perform:
            </p>
            {employeeServices.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {employeeServices.map((s) => (
                  <span
                    key={s.id}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-[#141a33] text-blue-400 border border-blue-700/50 hover:bg-blue-900/30 transition"
                  >
                    {s.title}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm">
                No services assigned yet
              </p>
            )}
          </div>

          {/* Button */}
          <div className="flex justify-center mt-6">
            <Button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md shadow-blue-900/30 text-sm"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

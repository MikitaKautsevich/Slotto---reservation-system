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

  const isAvailable = Math.random() > 0.3; // just for fun demo
  const joinedAt = new Date(employee.createdAt || Date.now()).toLocaleDateString();

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          key="modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg relative overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
          >
            <FaTimes size={18} />
          </button>
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 blur-md" />
              <Image
                src={employee.photoURL || "/placeholder.png"}
                alt={employee.name}
                width={96}
                height={96}
                className="rounded-full object-cover border-4 border-white shadow-md relative z-10"
              />
            </div>
            <h2 className="text-2xl font-semibold mt-4 text-gray-900">
              {employee.name}
            </h2>
            <p className="text-gray-600 text-sm">{employee.position || "Employee"}</p>

            <div
              className={`mt-3 text-xs font-medium px-3 py-1 rounded-full ${
                isAvailable
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isAvailable ? "Available" : "Busy"}
            </div>
          </div>
          <div className="space-y-2 text-gray-700 mb-5">
            {employee.email && (
              <p className="flex items-center gap-2">
                <FaEnvelope className="text-gray-400" /> {employee.email}
              </p>
            )}
            {employee.phone && (
              <p className="flex items-center gap-2">
                <FaPhone className="text-gray-400" /> {employee.phone}
              </p>
            )}
            <p className="flex items-center gap-2 text-gray-500 text-sm">
              <FaCalendarAlt className="text-gray-400" /> Joined on {joinedAt}
            </p>
          </div>

          {/* Services Section */}
          <div className="mb-6">
            <p className="font-semibold mb-3 text-gray-800">Services they can perform:</p>
            {employeeServices.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {employeeServices.map((s) => (
                  <span
                    key={s.id}
                    className="px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100 hover:from-blue-100 hover:to-indigo-100 transition"
                  >
                    {s.title}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No services assigned yet</p>
            )}
          </div>
          {employee.bio && (
            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="font-semibold text-gray-800 mb-2">About</p>
              <p className="text-gray-600 text-sm leading-relaxed">{employee.bio}</p>
            </div>
          )}
          <div className="flex justify-center mt-8">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl shadow hover:shadow-md transition"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

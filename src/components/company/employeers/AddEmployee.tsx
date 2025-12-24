"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import EmployeeScheduleCalendar from "../EmployeeScheduleCalendar";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaTimes, FaCamera } from "react-icons/fa";

export const AddEmployee = ({
  companyId,
  services,
  employee,
  onClose,
  onEmployeeAdded,
}: {
  companyId: string;
  services: Service[];
  employee: Employee | null;
  onClose: () => void;
  onEmployeeAdded?: (emp: Employee) => void;
}) => {
  const [name, setName] = useState(employee?.name || "");
  const [position, setPosition] = useState(employee?.position || "");
  const [email, setEmail] = useState(employee?.email || "");
  const [phone, setPhone] = useState(employee?.phone || "");
  const [bio, setBio] = useState(employee?.bio || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoURL, setPhotoURL] = useState(employee?.photoURL || "");
  const [selectedServices, setSelectedServices] = useState<string[]>(
    employee?.servicesIds || []
  );
  const [saving, setSaving] = useState(false);

  const handleServiceToggle = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSave = async () => {
    if (!name.trim() || !position.trim()) return alert("Please fill required fields.");
    setSaving(true);

    try {
      let finalPhotoURL = photoURL;
      if (photoFile) finalPhotoURL = await fileToBase64(photoFile);

      const employeeData = {
        name,
        position,
        email,
        phone,
        bio,
        photoURL: finalPhotoURL || "",
        servicesIds: selectedServices,
        createdAt: employee?.createdAt || new Date().toISOString(),
      };

      if (employee?.id) {
        await updateDoc(doc(db, "companies", companyId, "employees", employee.id), employeeData);
      } else {
        const docRef = await addDoc(collection(db, "companies", companyId, "employees"), employeeData);
        onEmployeeAdded?.({ id: docRef.id, ...employeeData });
      }

      onClose();
    } catch (err) {
      console.error("Error saving employee:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="bg-[#0a0f25] border border-gray-700 rounded-2xl shadow-2xl shadow-blue-900/30 p-6 sm:p-8 w-full max-w-4xl max-h-[85vh] overflow-y-auto relative text-gray-200"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
              {employee ? "Edit Employee" : "Add New Employee"}{" "}
              <FaUser className="text-blue-500" />
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition text-xl"
            >
              <FaTimes />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Photo + Services */}
            <div className="space-y-6">
              {/* Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    {(photoFile || photoURL) ? (
                      <img
                        src={photoFile ? URL.createObjectURL(photoFile) : photoURL}
                        alt="Preview"
                        className="w-28 h-28 rounded-xl object-cover border border-gray-700 group-hover:scale-105 transition-transform shadow-md shadow-blue-900/30"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-xl bg-[#12182d] border border-gray-700 flex items-center justify-center text-gray-500">
                        <FaCamera size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-900/30 file:text-blue-400 hover:file:bg-blue-800/50 cursor-pointer"
                      onChange={(e) => {
                        setPhotoFile(e.target.files?.[0] || null);
                        setPhotoURL("");
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Or paste image URL"
                      value={photoURL}
                      onChange={(e) => {
                        setPhotoURL(e.target.value);
                        setPhotoFile(null);
                      }}
                      className="w-full rounded-lg border border-gray-700 bg-[#12182d] p-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Services
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto rounded-xl border border-gray-700 p-3 bg-[#12182d]">
                  {services.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-blue-400 transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(s.id)}
                        onChange={() => handleServiceToggle(s.id)}
                        className="accent-blue-600 w-4 h-4"
                      />
                      {s.title}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Fields */}
            <div className="space-y-4">
              {[
                {
                  label: "Full Name",
                  required: true,
                  value: name,
                  setter: setName,
                  placeholder: "John Doe",
                },
                {
                  label: "Position",
                  required: true,
                  value: position,
                  setter: setPosition,
                  placeholder: "Hair Stylist",
                },
                { label: "Email", value: email, setter: setEmail, placeholder: "employee@email.com" },
                { label: "Phone", value: phone, setter: setPhone, placeholder: "+421 987 654 321" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    {f.label}
                    {f.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={f.value}
                    onChange={(e) => f.setter(e.target.value)}
                    className={`w-full rounded-lg border ${
                      !f.value.trim() && f.required
                        ? "border-red-600"
                        : "border-gray-700"
                    } bg-[#12182d] p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition`}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  About / Notes
                </label>
                <textarea
                  placeholder="Short bio or notes..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-700 bg-[#12182d] p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          {employee?.id && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-3">
                Work Schedule
              </h3>
              <div className="rounded-xl border border-gray-700 p-3 bg-[#12182d]">
                <EmployeeScheduleCalendar
                  companyId={companyId}
                  employeeId={employee.id}
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-600 text-gray-300 bg-[#12182d] hover:bg-gray-800 font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2 rounded-lg font-medium text-white shadow-md transition-all ${
                saving
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-900/30"
              }`}
            >
              {saving ? "Saving..." : employee ? "Save Changes" : "Add Employee"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

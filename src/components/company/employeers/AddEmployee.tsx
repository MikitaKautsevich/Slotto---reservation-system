// "use client";

// import { useState } from "react";
// import { db } from "@/lib/firebase";
// import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
// import EmployeeScheduleCalendar from "../EmployeeScheduleCalendar";
// import { Service } from "@/types/service";
// import { Employee } from "@/types/employee";

// export const AddEmployee = ({
//   companyId,
//   services,
//   employee,
//   onClose,
//   onEmployeeAdded,
// }: {
//   companyId: string;
//   services: Service[];
//   employee: Employee | null;
//   onClose: () => void;
//   onEmployeeAdded?: (emp: Employee) => void;
// }) => {
//   const [name, setName] = useState(employee?.name || "");
//   const [position, setPosition] = useState(employee?.position || "");
//   const [email, setEmail] = useState(employee?.email || "");
//   const [phone, setPhone] = useState(employee?.phone || "");
//   const [photoFile, setPhotoFile] = useState<File | null>(null);
//   const [photoURL, setPhotoURL] = useState(employee?.photoURL || "");
//   const [selectedServices, setSelectedServices] = useState<string[]>(
//     employee?.servicesIds || []
//   );

//   const [saving, setSaving] = useState(false);

//   const handleServiceToggle = (id: string) => {
//     setSelectedServices((prev) =>
//       prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
//     );
//   };

//   const fileToBase64 = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result as string);
//       reader.onerror = (error) => reject(error);
//     });
//   };

//   const handleSave = async () => {
//     if (!name || !position) return;

//     setSaving(true);
//     try {
//       let finalPhotoURL = photoURL;

//       if (photoFile) {
//         finalPhotoURL = await fileToBase64(photoFile);
//       }

//       const employeeData = {
//         name,
//         position,
//         email,
//         phone,
//         photoURL: finalPhotoURL || "",
//         servicesIds: selectedServices,
//       };

//       if (employee?.id) {
//         await updateDoc(
//           doc(db, "companies", companyId, "employees", employee.id),
//           employeeData
//         );
//       } else {
//         const docRef = await addDoc(
//           collection(db, "companies", companyId, "employees"),
//           employeeData
//         );
//         if (onEmployeeAdded) {
//           onEmployeeAdded({ id: docRef.id, ...employeeData });
//         }
//       }

//       onClose();
//     } catch (err) {
//       console.error("Error saving employee:", err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
//       <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl overflow-y-auto max-h-[90vh] border border-gray-100">
//         <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
//           <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
//             {employee ? "Edit Employee" : "Add New Employee"} 👤
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-700 transition-colors text-2xl font-bold"
//           >
//             ×
//           </button>
//         </div>
//         <div className="grid md:grid-cols-2 gap-6">
//           <div className="space-y-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
//             <div className="flex items-center gap-4">
//               {(photoFile || photoURL) ? (
//                 <img
//                   src={photoFile ? URL.createObjectURL(photoFile) : photoURL}
//                   alt="Preview"
//                   className="w-24 h-24 rounded-xl object-cover shadow-sm border border-gray-200"
//                 />
//               ) : (
//                 <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
//                   📷
//                 </div>
//               )}
//               <div className="flex-1">
//                 <input
//                   type="file"
//                   accept="image/*"
//                   className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
//                   onChange={(e) => {
//                     setPhotoFile(e.target.files?.[0] || null);
//                     setPhotoURL("");
//                   }}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Or paste image URL"
//                   value={photoURL}
//                   onChange={(e) => {
//                     setPhotoURL(e.target.value);
//                     setPhotoFile(null);
//                   }}
//                   className="mt-2 w-full rounded-xl border border-gray-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
//                 />
//               </div>
//             </div>
//             <div>
//               <p className="block text-sm font-medium text-gray-700 mb-2">Services</p>
//               <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto rounded-xl border border-gray-100 p-3 bg-gray-50">
//                 {services.map((s) => (
//                   <label
//                     key={s.id}
//                     className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-blue-600 transition"
//                   >
//                     <input
//                       type="checkbox"
//                       checked={selectedServices.includes(s.id)}
//                       onChange={() => handleServiceToggle(s.id)}
//                       className="accent-blue-600 w-4 h-4"
//                     />
//                     {s.title}
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>
//           <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//             <input
//               type="text"
//               placeholder="John Doe"
//               className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 outline-none transition-all"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
//             <input
//               type="text"
//               placeholder="Hair Stylist"
//               className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 outline-none transition-all"
//               value={position}
//               onChange={(e) => setPosition(e.target.value)}
//             />
//           </div>
//           {/* Email */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//             <input
//               type="email"
//               placeholder="employee@email.com"
//               className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 outline-none transition-all"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>
//           {/* Phone */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//             <input
//               type="tel"
//               placeholder="+421 987 654 321"
//               className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 outline-none transition-all"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//             />
//           </div>
//           </div>
//         </div>
//         {employee?.id && (
//           <div className="mt-8">
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">Work Schedule</h3>
//             <div className="rounded-xl border border-gray-100 p-3 bg-gray-50">
//               <EmployeeScheduleCalendar companyId={companyId} employeeId={employee.id} />
//             </div>
//           </div>
//         )}
//         <div className="flex justify-end gap-3 mt-8">
//           <button
//             onClick={onClose}
//             className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium transition-all duration-300"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSave}
//             disabled={saving}
//             className={`px-6 py-2.5 rounded-xl font-medium text-white shadow-md transition-all duration-300 ${
//               saving
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
//             }`}
//           >
//             {saving ? "Saving..." : "Save"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


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
        await updateDoc(
          doc(db, "companies", companyId, "employees", employee.id),
          employeeData
        );
      } else {
        const docRef = await addDoc(
          collection(db, "companies", companyId, "employees"),
          employeeData
        );
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative border border-gray-100"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              {employee ? "Edit Employee" : "Add New Employee"} <FaUser className="text-blue-600" />
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition text-2xl font-bold"
            >
              <FaTimes />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left side - Photo + Services */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    {(photoFile || photoURL) ? (
                      <img
                        src={photoFile ? URL.createObjectURL(photoFile) : photoURL}
                        alt="Preview"
                        className="w-28 h-28 rounded-2xl object-cover border-2 border-blue-200 group-hover:scale-105 transition-transform shadow-md"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                        <FaCamera size={22} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
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
                      className="w-full rounded-xl border border-gray-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto rounded-xl border border-gray-100 p-3 bg-gray-50">
                  {services.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-blue-600"
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

            {/* Right side - Form fields */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-xl border ${
                    !name.trim() ? "border-red-300" : "border-gray-200"
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 outline-none transition`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Hair Stylist"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className={`w-full rounded-xl border ${
                    !position.trim() ? "border-red-300" : "border-gray-200"
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 outline-none transition`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="employee@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  placeholder="+421 987 654 321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">About / Notes</label>
                <textarea
                  placeholder="Short bio or notes about this employee..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          {employee?.id && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Work Schedule</h3>
              <div className="rounded-xl border border-gray-100 p-3 bg-gray-50">
                <EmployeeScheduleCalendar companyId={companyId} employeeId={employee.id} />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2.5 rounded-xl font-medium text-white shadow-md transition-all ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
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

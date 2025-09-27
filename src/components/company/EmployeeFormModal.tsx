"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import Button from "@/components/ui/Button";
import EmployeeScheduleCalendar from "./EmployeeScheduleCalendar";

export default function EmployeeFormModal({
  companyId,
  services,
  employee,
  onClose,
  onEmployeeAdded,
}: {
  companyId: string;
  services: any[];
  employee: any | null;
  onClose: () => void;
  onEmployeeAdded?: (emp: any) => void;
}) {
  const [name, setName] = useState(employee?.name || "");
  const [position, setPosition] = useState(employee?.position || "");
  const [email, setEmail] = useState(employee?.email || "");
  const [phone, setPhone] = useState(employee?.phone || "");
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

  // --- Преобразование файла в Base64 ---
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // --- Сохранение сотрудника ---
  const handleSave = async () => {
    if (!name || !position) return;

    setSaving(true);
    try {
      let finalPhotoURL = photoURL;

      // Если выбран файл — преобразуем в Base64
      if (photoFile) {
        finalPhotoURL = await fileToBase64(photoFile);
      }

      const employeeData = {
        name,
        position,
        email,
        phone,
        photoURL: finalPhotoURL || "",
        servicesIds: selectedServices,
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
        if (onEmployeeAdded) {
          onEmployeeAdded({ id: docRef.id, ...employeeData });
        }
      }

      onClose();
    } catch (err) {
      console.error("Error saving employee:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-5xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold mb-4">
          {employee ? "Edit Employee" : "New Employee"}
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Position */}
          <div>
            <label className="block font-medium mb-1">Position</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block font-medium mb-1">Phone</label>
            <input
              type="tel"
              className="w-full border rounded-lg p-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Photo */}
          <div>
            <label className="block font-medium mb-1">Photo</label>
            <input
              type="file"
              accept="image/*"
              className="w-full"
              onChange={(e) => {
                setPhotoFile(e.target.files?.[0] || null);
                setPhotoURL(""); // если выбираем файл, очищаем URL
              }}
            />
            <input
              type="text"
              placeholder="Or paste image URL"
              value={photoURL}
              onChange={(e) => {
                setPhotoURL(e.target.value);
                setPhotoFile(null); // если вставляем URL, очищаем файл
              }}
              className="w-full border p-2 rounded mt-2"
            />

            {/* Preview */}
            {(photoFile || photoURL) && (
              <img
                src={photoFile ? URL.createObjectURL(photoFile) : photoURL}
                alt="Preview"
                className="w-24 h-24 rounded-lg mt-2 object-cover"
              />
            )}
          </div>

          {/* Services */}
          <div>
            <p className="font-medium mb-2">Employee Services:</p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {services.map((s) => (
                <label key={s.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(s.id)}
                    onChange={() => handleServiceToggle(s.id)}
                  />
                  {s.title}
                </label>
              ))}
            </div>
          </div>

          {/* Schedule Calendar */}
          {employee?.id && (
            <div>
              <p className="font-medium mb-2">Work Schedule:</p>
              <EmployeeScheduleCalendar
                companyId={companyId}
                employeeId={employee.id}
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onClose} className="bg-gray-200 text-gray-700">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

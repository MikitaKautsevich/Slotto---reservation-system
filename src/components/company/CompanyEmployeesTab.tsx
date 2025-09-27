"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Button from "@/components/ui/Button";
import EmployeeFormModal from "./EmployeeFormModal";
import { FaUser } from "react-icons/fa";
import InfoPopup from "../InfoPopup";
import Popup from "../Popup";

// --- Employee Details Modal ---
function EmployeeDetailsModal({
  employee,
  services,
  onClose,
}: {
  employee: any;
  services: any[];
  onClose: () => void;
}) {
  if (!employee) return null;

  const employeeServices = services.filter((s) =>
    (employee.servicesIds || []).includes(s.id)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Employee Details</h2>
        <div className="flex gap-4 items-center mb-4">
          <img
            src={employee.photoURL || "/placeholder.png"}
            alt={employee.name}
            className="w-20 h-20 object-cover rounded-xl"
          />
          <div>
            <p className="font-bold text-lg">{employee.name}</p>
            <p className="text-gray-600">{employee.position}</p>
          </div>
        </div>
        <p className="text-gray-700 mb-2">
          <strong>Email:</strong> {employee.email}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Phone:</strong> {employee.phone}
        </p>

        <div className="mt-4">
          <p className="font-medium mb-2">Services, which can do:</p>
          {employeeServices.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700">
              {employeeServices.map((s) => (
                <li key={s.id}>
                  {s.title} <span className="text-sm text-gray-500">({s.category})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Nothing selected</p>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} className="bg-blue-600 text-white">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyEmployeesTab({ companyId }: { companyId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewEmployee, setViewEmployee] = useState<any | null>(null);

  const [infoPopup, setInfoPopup] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        return;
      }

      // --- Real-time employees ---
      const employeesRef = collection(db, "companies", companyId, "employees");
      const unsubscribeEmployees = onSnapshot(employeesRef, (snapshot) => {
        const data: any[] = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
        setEmployees(data);
        setLoading(false);
      });

      // --- Load services once ---
      (async () => {
        const servicesRef = collection(db, "companies", companyId, "services");
        const snapshot = await getDocs(servicesRef);
        const data: any[] = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
        setServices(data);
      })();

      return unsubscribeEmployees;
    });

    return () => unsubscribeAuth();
  }, [companyId]);

  const handleDeleteEmployee = async (employeeId: string) => {
    await deleteDoc(doc(db, "companies", companyId, "employees", employeeId));
    setConfirmDeleteId(null);
    setInfoPopup({ title: "Deleted", message: "Employee was deleted sucessfully✅" });
  };

  if (loading)
    return <p className="text-gray-500 text-center mt-10">Loading employees...</p>;
  if (!user)
    return <p className="text-red-500 text-center mt-10">Please log in to view employees.</p>;

  return (
    <div className="w-full p-4 sm:p-6">
      {/* Add Employee Button */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => {
            setEditEmployee(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl"
        >
          + New Employee
        </Button>
      </div>

      {/* Employees List */}
      {employees.length === 0 ? (
        <p className="text-gray-500 text-center">No employees yet</p>
      ) : (
        <div className="space-y-4 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Employees</h2>
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-gray-50 rounded-xl p-4 flex justify-between items-start shadow-sm rounded-xl p-4 flex items-start gap-4 shadow hover:shadow-md transition cursor-pointer"
              onClick={() => setViewEmployee(emp)}
            >
              {emp.photoURL ? (
                <img
                  src={emp.photoURL}
                  alt={emp.name}
                  className="w-20 h-20 object-cover rounded-xl"
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-xl">
                  <FaUser className="text-gray-500 text-3xl" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{emp.name}</p>
                <p className="text-gray-600">{emp.position}</p>
                <p className="text-gray-500 text-sm">
                  {emp.email} | {emp.phone}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditEmployee(emp);
                    setShowModal(true);
                  }}
                  className="bg-blue-100 text-blue-700 px-4 py-1 rounded-lg text-sm font-medium hover:bg-blue-200"
                >
                  ✏️ Edit
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteId(emp.id);
                  }}
                  className="bg-red-600 text-red-700 px-4 py-1 rounded-lg text-sm font-medium hover:bg-red-700 hover:text-white"
                >
                  🗑 Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employee Form Modal */}
      {showModal && (
        <EmployeeFormModal
          companyId={companyId}
          services={services}
          employee={editEmployee}
          onClose={() => setShowModal(false)} 
          onEmployeeAdded={() => setShowModal(false)} />
      )}

      {/* Confirm Delete Popup */}
      {confirmDeleteId && (
        <Popup
          title="Delete Employee"
          message="Are you sure you want to delete this employee? This action cannot be undone."
          onConfirm={() => handleDeleteEmployee(confirmDeleteId)}
          onClose={() => setConfirmDeleteId(null)}
        />
      )}

      {/* Employee Details Modal */}
      {viewEmployee && (
        <EmployeeDetailsModal
          employee={viewEmployee}
          services={services}
          onClose={() => setViewEmployee(null)}
        />
      )}

      {/* Info Popup */}
      {infoPopup && (
        <InfoPopup
          title={infoPopup.title}
          message={infoPopup.message}
          onClose={() => setInfoPopup(null)}
        />
      )}
    </div>
  );
}

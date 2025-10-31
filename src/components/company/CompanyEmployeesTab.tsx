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
import { Employee } from "@/types/employee";
import { Service } from "@/types/service";

function EmployeeDetailsModal({
  employee,
  services,
  onClose,
}: {
  employee: Employee;
  services: Service[];
  onClose: () => void;
}) {
  if (!employee) return null;

  const employeeServices = services.filter((s) =>
    (employee.services || []).includes(s.id)
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
                  {s.title} <span className="text-sm text-gray-500">({s.title})</span>
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);

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
    <div>
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
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <FaUser className="text-4xl mb-3 opacity-60" />
          <p className="text-lg">No employees yet</p>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
            👥 Employees
            <span className="text-sm text-gray-500 font-normal">({employees.length})</span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                onClick={() => setViewEmployee(emp)}
              >
                {/* Header with photo */}
                <div className="flex items-center gap-4">
                  {emp.photoURL ? (
                    <img
                      src={emp.photoURL}
                      alt={emp.name}
                      className="w-16 h-16 rounded-xl object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-200 to-gray-300">
                      <FaUser className="text-gray-500 text-2xl" />
                    </div>
                  )}

                  <div>
                    <p className="text-lg font-semibold text-gray-900">{emp.name}</p>
                    <p className="text-sm text-gray-600">{emp.position}</p>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-4 text-sm text-gray-500">
                  <p>
                    📧 <span className="text-gray-700">{emp.email}</span>
                  </p>
                  <p>
                    📞 <span className="text-gray-700">{emp.phone}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditEmployee(emp);
                      setShowModal(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-all duration-300"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(emp.id);
                    }}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 hover:text-red-700 transition-all duration-300"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
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

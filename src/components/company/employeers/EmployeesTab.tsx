"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Button from "@/components/custom/Button";
import { AddEmployee } from "./AddEmployee";
import { FaUser, FaSearch } from "react-icons/fa";
import InfoPopup from "../../custom/InfoPopup";
import Popup from "../../custom/Popup";
import { Employee } from "@/types/employee";
import { Service } from "@/types/service";
import { EmployeeDetails } from "./EmployeeDetails";
import Input from "@/components/custom/Input";
import Select from "@/components/custom/Select";
import { InfoMessage } from "@/components/custom/InfoMessage";
import { Loading } from "@/app/Loading";

export const EmployeesTab = ({ companyId }: { companyId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

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

      const employeesRef = collection(db, "companies", companyId, "employees");
      const unsubscribeEmployees = onSnapshot(employeesRef, (snapshot) => {
        const data: Employee[] = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Employee));
        setEmployees(data);
        setLoading(false);
      });

      (async () => {
        const servicesRef = collection(db, "companies", companyId, "services");
        const snapshot = await getDocs(servicesRef);
        const data: Service[] = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Service));
        setServices(data);
      })();

      return unsubscribeEmployees;
    });

    return () => unsubscribeAuth();
  }, [companyId]);

  const handleDeleteEmployee = async (employeeId: string) => {
    await deleteDoc(doc(db, "companies", companyId, "employees", employeeId));
    setConfirmDeleteId(null);
    setInfoPopup({ title: "Deleted", message: "Employee deleted successfully ✅" });
  };

  const departments = Array.from(new Set(employees.map((e) => e.position))).filter(Boolean);
  const filteredEmployees = employees.filter((emp) => {
    const matchesName = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === "all" || emp.position === selectedDepartment;
    return matchesName && matchesDept;
  });

  if (loading)return <Loading/>

  if (!user)
    return (
      <InfoMessage
        type="info"
        title="Not Logged In"
        message="Please log in to view employees."
      />
    );

  return (
    <div className="min-h-screen p-6 lg:p-10 rounded-2xl bg-[#0a0f25] border border-gray-700 shadow-lg shadow-blue-900/30 max-w-6xl mx-auto text-gray-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-semibold text-white flex items-center gap-2">
          👥 Employees
          <span className="text-sm text-gray-500 font-normal">
            ({employees.length})
          </span>
        </h2>
        <Button
          onClick={() => {
            setEditEmployee(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl shadow-md shadow-blue-900/40"
        >
          + New Employee
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <div className="relative w-full sm:w-1/2">
          <FaSearch className="absolute left-3 top-3 text-gray-500" />
          <Input
            type="text"
            placeholder="Search employee by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#12182d] text-gray-200 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
          />
        </div>
        <Select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          options={["all", ...departments]}
          className="bg-[#12182d] border border-gray-700 rounded-xl py-2 px-4 text-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
      </div>

      {/* Employees List */}
      {filteredEmployees.length === 0 ? (
        <InfoMessage
          type="info"
          title="No Employees Found"
          message="No employees match your search or filter criteria."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => setViewEmployee(emp)}
              className="group bg-[#12182d] border border-gray-700 rounded-2xl p-5 hover:shadow-xl hover:shadow-blue-900/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-4">
                {emp.photoURL ? (
                  <Image
                    width={64}
                    height={64}
                    src={emp.photoURL}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-700"
                    alt={emp.name}
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-[#1a1f35] border border-gray-700">
                    <FaUser className="text-gray-500 text-2xl" />
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold text-white">{emp.name}</p>
                  <p className="text-sm text-gray-400">{emp.position}</p>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-400">
                {emp.email && <p>📧 {emp.email}</p>}
                {emp.phone && <p>📞 {emp.phone}</p>}
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditEmployee(emp);
                    setShowModal(true);
                  }}
                  className="px-4 py-2 text-sm font-medium text-yellow-400 bg-yellow-900/20 rounded-xl hover:bg-yellow-800/40 hover:text-yellow-300 transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteId(emp.id);
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-400 bg-red-900/20 rounded-xl hover:bg-red-800/40 hover:text-red-300 transition"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Adding/Editing */}
      {showModal && (
        <AddEmployee
          companyId={companyId}
          services={services}
          employee={editEmployee}
          onClose={() => setShowModal(false)}
          onEmployeeAdded={() => setShowModal(false)}
        />
      )}

      {/* Confirm Delete */}
      {confirmDeleteId && (
        <Popup
          title="Delete Employee"
          message="Are you sure you want to delete this employee? This action cannot be undone."
          onConfirm={() => handleDeleteEmployee(confirmDeleteId)}
          onClose={() => setConfirmDeleteId(null)}
        />
      )}

      {/* Employee Details */}
      {viewEmployee && (
        <EmployeeDetails
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
};

"use client";

import { FC, useState, useEffect } from "react";
import {
  FaUser,
  FaStickyNote,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import InfoPopup from "@/components/InfoPopup";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Service {
  id: string;
  title: string;
  price: number;
}

interface Company {
  id: string;
  name: string;
  address?: string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
}

interface Participant {
  name: string;
  serviceId: string;
  employeeId: string;
  time: string;
  date?: string;
  isMain?: boolean; // главный клиент
}

const InputWithLabel: FC<
  { label: string; icon?: React.ReactNode; error?: string } & React.InputHTMLAttributes<HTMLInputElement>
> = ({ label, icon, error, ...props }) => (
  <div className="w-full">
    <label className="block font-semibold text-gray-700 mb-1">{label}</label>
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
      <Input
        {...props}
        className={`w-full ${icon ? "pl-10" : ""} border ${
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
        } rounded-lg`}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const CreateReservation: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companyAddress, setCompanyAddress] = useState<string>("");

  const [participantsCount, setParticipantsCount] = useState(1);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [infoPopup, setInfoPopup] = useState<{ title: string; message: string } | null>(null);

  // === LOAD COMPANIES ===
  useEffect(() => {
    const fetchCompanies = async () => {
      const snapshot = await getDocs(collection(db, "companies"));
      const companyList: Company[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        address: doc.data().address,
      }));
      setCompanies(companyList);
      if (companyList.length > 0) {
        setSelectedCompany(companyList[0].id);
        setCompanyAddress(companyList[0].address || "");
      }
    };
    fetchCompanies();
  }, []);

  // === LOAD SERVICES & EMPLOYEES ===
  useEffect(() => {
    if (!selectedCompany) return;
    const q1 = collection(db, "companies", selectedCompany, "services");
    const unsub1 = onSnapshot(q1, (snapshot) => {
      const data: Service[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Service));
      setServices(data);
    });

    const q2 = collection(db, "companies", selectedCompany, "employees");
    const unsub2 = onSnapshot(q2, (snapshot) => {
      const data: Employee[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(data);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [selectedCompany]);

  // === LOAD ADDRESS ===
  useEffect(() => {
    if (!selectedCompany) return;
    const fetchAddress = async () => {
      const docRef = doc(db, "companies", selectedCompany);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setCompanyAddress(docSnap.data().address || "");
    };
    fetchAddress();
  }, [selectedCompany]);

  // === LOAD USER ===
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setClientName(u.displayName || "");
        setClientEmail(u.email || "");

        // пробуем взять телефон из users/{uid}
        const docRef = doc(db, "users", u.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setClientPhone(snap.data().phone || "");
        }
      }
    });
    return () => unsub();
  }, []);

// === HANDLE PARTICIPANTS ===
useEffect(() => {
  const arr: Participant[] = [];
  for (let i = 0; i < participantsCount; i++) {
    if (i === 0) {
      arr.push({
        name: clientName,
        serviceId: "",
        employeeId: "",
        time: "",
        date: "",
        isMain: true,
      });
    } else {
      arr.push({
        name: "",
        serviceId: "",
        employeeId: "",
        time: "",
        date: "",
        isMain: false,
      });
    }
  }
  setParticipants(arr);
}, [participantsCount, clientName]);


  // === VALIDATION ===
  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // if (!clientName.trim() || !/^[A-Za-zА-Яа-я\s]+$/.test(clientName))
    //   newErrors.clientName = "Enter a valid name";
    if (!clientEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.clientEmail = "Invalid email";
    if (!clientPhone.trim() || !/^[0-9+]+$/.test(clientPhone))
      newErrors.clientPhone = "Enter a valid phone number";

    if (participantsCount > 1) {
      participants.forEach((p, i) => {
        if (!p.name.trim() || !/^[A-Za-zА-Яа-я\s]+$/.test(p.name)) {
          newErrors[`p${i}_name`] = "Enter a valid name";
        }
        if (!p.serviceId) newErrors[`p${i}_service`] = "Select service";
        if (!p.employeeId) newErrors[`p${i}_employee`] = "Select employee";
        if (!p.time) newErrors[`p${i}_time`] = "Select time";
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // === CREATE RESERVATION ===
const handleCreate = async () => {
  if (!validate()) return;

  try {
    const reservation = {
      userId: user?.uid || null,
      companyId: selectedCompany,
      companyAddress,
      participantsCount,
      participants: participants.map((p) => ({
        ...p,
        name: p.name || null,
        serviceId: p.serviceId || null,
        employeeId: p.employeeId || null,
        date: p.date || null,
        time: p.time || null,
      })),
      clientName,
      clientEmail,
      clientPhone,
      notes: notes || null,
      createdAt: Timestamp.now(),
      status: "pending",
    };

    console.log("Saving reservation:", reservation);

    await addDoc(
      collection(db, "companies", selectedCompany, "reservations"),
      reservation
    )

    setInfoPopup({
      title: "✅ Success",
      message: "Reservation successfully created!",
    });

    // очистка формы
    setParticipantsCount(1);
    setParticipants([]);
    setNotes("");
  } catch (err) {
    console.error("Create reservation error:", err);
    setInfoPopup({
      title: "❌ Error",
      message: "Failed to create reservation",
    });
  }
};

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-10 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-800">Create Reservation</h2>

      {/* Company */}
      <div>
        <label className="block font-semibold mb-1">Select Place</label>
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="w-full border p-3 rounded-lg"
        >
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {companyAddress && <p className="text-sm text-gray-600 mt-1">📍 {companyAddress}</p>}
      </div>

      {/* Participants count */}
      <InputWithLabel
        label="Number of Participants (max 3)"
        icon={<FaUser />}
        type="number"
        min={1}
        max={3}
        value={participantsCount}
        onChange={(e) => setParticipantsCount(Number(e.target.value))}
      />

      {/* Participants */}
      {/* {participantsCount > 1 &&
        participants.map((p, i) => (
          <div key={i} className="p-4 border rounded-xl space-y-3 bg-gray-50">
            <h3 className="font-semibold text-lg">
              Participant {i + 1} {p.isMain && "(Main Client)"}
            </h3>

            {!p.isMain && (
              <InputWithLabel
                label="Name"
                value={p.name}
                onChange={(e) => {
                  const newP = [...participants];
                  newP[i].name = e.target.value;
                  setParticipants(newP);
                }}
                error={errors[`p${i}_name`]}
              />
            )}

            <div>
              <label className="block font-semibold mb-1">Service</label>
              <select
                value={p.serviceId}
                onChange={(e) => {
                  const newP = [...participants];
                  newP[i].serviceId = e.target.value;
                  setParticipants(newP);
                }}
                className={`w-full border p-2 rounded-lg ${
                  errors[`p${i}_service`] ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} - {s.price}€
                  </option>
                ))}
              </select>
              {errors[`p${i}_service`] && (
                <p className="text-red-500 text-xs mt-1">{errors[`p${i}_service`]}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1">Employee</label>
              <select
                value={p.employeeId}
                onChange={(e) => {
                  const newP = [...participants];
                  newP[i].employeeId = e.target.value;
                  setParticipants(newP);
                }}
                className={`w-full border p-2 rounded-lg ${
                  errors[`p${i}_employee`] ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.position})
                  </option>
                ))}
              </select>
              {errors[`p${i}_employee`] && (
                <p className="text-red-500 text-xs mt-1">{errors[`p${i}_employee`]}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1">Time</label>
              <input
                type="time"
                value={p.time}
                onChange={(e) => {
                  const newP = [...participants];
                  newP[i].time = e.target.value;
                  setParticipants(newP);
                }}
                className={`w-full border p-2 rounded-lg ${
                  errors[`p${i}_time`] ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors[`p${i}_time`] && (
                <p className="text-red-500 text-xs mt-1">{errors[`p${i}_time`]}</p>
              )}
            </div>
          </div>
        ))} */}
        {/* Participants */}
{participantsCount > 0 &&
  (participantsCount === 1 ? (
    <div className="p-4 border rounded-xl space-y-3 bg-gray-50">
      <h3 className="font-semibold text-lg">Main Client Reservation</h3>

      {/* Service */}
      <div>
        <label className="block font-semibold mb-1">Service</label>
        <select
          value={participants[0]?.serviceId || ""}
          onChange={(e) => {
            const arr = [{ ...participants[0], serviceId: e.target.value }];
            setParticipants(arr);
          }}
          className={`w-full border p-2 rounded-lg ${
            errors[`p0_service`] ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select Service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} - {s.price}€
            </option>
          ))}
        </select>
        {errors[`p0_service`] && (
          <p className="text-red-500 text-xs mt-1">{errors[`p0_service`]}</p>
        )}
      </div>

      {/* Employee */}
      <div>
        <label className="block font-semibold mb-1">Employee</label>
        <select
          value={participants[0]?.employeeId || ""}
          onChange={(e) => {
            const arr = [{ ...participants[0], employeeId: e.target.value }];
            setParticipants(arr);
          }}
          className={`w-full border p-2 rounded-lg ${
            errors[`p0_employee`] ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.position})
            </option>
          ))}
        </select>
        {errors[`p0_employee`] && (
          <p className="text-red-500 text-xs mt-1">{errors[`p0_employee`]}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block font-semibold mb-1">Date</label>
        <input
          type="date"
          value={participants[0]?.date || ""}
          onChange={(e) => {
            const arr = [{ ...participants[0], date: e.target.value }];
            setParticipants(arr);
          }}
          className={`w-full border p-2 rounded-lg ${
            errors[`p0_date`] ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors[`p0_date`] && (
          <p className="text-red-500 text-xs mt-1">{errors[`p0_date`]}</p>
        )}
      </div>

      {/* Time */}
      <div>
        <label className="block font-semibold mb-1">Time</label>
        <input
          type="time"
          value={participants[0]?.time || ""}
          onChange={(e) => {
            const arr = [{ ...participants[0], time: e.target.value }];
            setParticipants(arr);
          }}
          className={`w-full border p-2 rounded-lg ${
            errors[`p0_time`] ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors[`p0_time`] && (
          <p className="text-red-500 text-xs mt-1">{errors[`p0_time`]}</p>
        )}
      </div>
    </div>
  ) : (
    participants.map((p, i) => (
      <div key={i} className="p-4 border rounded-xl space-y-3 bg-gray-50">
        <h3 className="font-semibold text-lg">
          Participant {i + 1} {p.isMain && "(Main Client)"}
        </h3>

        {!p.isMain && (
          <InputWithLabel
            label="Name"
            value={p.name}
            onChange={(e) => {
              const newP = [...participants];
              newP[i].name = e.target.value;
              setParticipants(newP);
            }}
            error={errors[`p${i}_name`]}
          />
        )}

        {/* Service */}
        <div>
          <label className="block font-semibold mb-1">Service</label>
          <select
            value={p.serviceId}
            onChange={(e) => {
              const newP = [...participants];
              newP[i].serviceId = e.target.value;
              setParticipants(newP);
            }}
            className={`w-full border p-2 rounded-lg ${
              errors[`p${i}_service`] ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} - {s.price}€
              </option>
            ))}
          </select>
          {errors[`p${i}_service`] && (
            <p className="text-red-500 text-xs mt-1">{errors[`p${i}_service`]}</p>
          )}
        </div>

        {/* Employee */}
        <div>
          <label className="block font-semibold mb-1">Employee</label>
          <select
            value={p.employeeId}
            onChange={(e) => {
              const newP = [...participants];
              newP[i].employeeId = e.target.value;
              setParticipants(newP);
            }}
            className={`w-full border p-2 rounded-lg ${
              errors[`p${i}_employee`] ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.position})
              </option>
            ))}
          </select>
          {errors[`p${i}_employee`] && (
            <p className="text-red-500 text-xs mt-1">{errors[`p${i}_employee`]}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block font-semibold mb-1">Date</label>
          <input
            type="date"
            value={p.date || ""}
            onChange={(e) => {
              const newP = [...participants];
              newP[i].date = e.target.value;
              setParticipants(newP);
            }}
            className={`w-full border p-2 rounded-lg ${
              errors[`p${i}_date`] ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors[`p${i}_date`] && (
            <p className="text-red-500 text-xs mt-1">{errors[`p${i}_date`]}</p>
          )}
        </div>

        {/* Time */}
        <div>
          <label className="block font-semibold mb-1">Time</label>
          <input
            type="time"
            value={p.time || ""}
            onChange={(e) => {
              const newP = [...participants];
              newP[i].time = e.target.value;
              setParticipants(newP);
            }}
            className={`w-full border p-2 rounded-lg ${
              errors[`p${i}_time`] ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors[`p${i}_time`] && (
            <p className="text-red-500 text-xs mt-1">{errors[`p${i}_time`]}</p>
          )}
        </div>
      </div>
    ))
  ))}


      {/* Main Client Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputWithLabel
          label="Main Client Name"
          icon={<FaUser />}
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          error={errors.clientName}
        />
        <InputWithLabel
          label="Main Client Email"
          icon={<FaEnvelope />}
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          error={errors.clientEmail}
        />
        <InputWithLabel
          label="Main Client Phone"
          icon={<FaPhone />}
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          error={errors.clientPhone}
        />
      </div>

      {/* Notes */}
      <InputWithLabel
        label="Notes (optional)"
        icon={<FaStickyNote />}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <Button
        onClick={handleCreate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3"
      >
        Reserve Now
      </Button>

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

export default CreateReservation;

"use client";

import { FC, useState, useEffect, useCallback } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaStickyNote,
  FaEnvelope,
  FaBuilding,
} from "react-icons/fa";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import InfoPopup from "@/components/InfoPopup";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Plan {
  id: string;
  name: string;
  basePrice: number;
}

interface Company {
  id: string;
  name: string;
}

const plans: Plan[] = [
  { id: "basic", name: "Basic", basePrice: 20 },
  { id: "premium", name: "Premium", basePrice: 40 },
  { id: "vip", name: "VIP", basePrice: 60 },
];

const InputWithIcon: FC<
  { icon: React.ReactNode; error?: string } & React.InputHTMLAttributes<HTMLInputElement>
> = ({ icon, error, ...props }) => (
  <div className="w-full">
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      <Input
        {...props}
        className={`pl-10 w-full border ${
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
        }`}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const CreateReservation: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00");
  const [participants, setParticipants] = useState(1);
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan>(plans[0]);
  const [price, setPrice] = useState(selectedPlan.basePrice);

  const [infoPopup, setInfoPopup] = useState<{ title: string; message: string } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setName(u.displayName || "");
        setEmail(u.email || "");
      }
    });
    return () => unsubscribe();
  }, []);

  // Загрузка компаний из Firestore
  useEffect(() => {
    const fetchCompanies = async () => {
      const snapshot = await getDocs(collection(db, "companies"));
      const companyList: Company[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setCompanies(companyList);
      if (companyList.length > 0) setSelectedCompany(companyList[0].id);
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    setPrice(participants * selectedPlan.basePrice);
  }, [participants, selectedPlan]);

  const validate = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = "Please enter your name";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Invalid email address";
    if (!date) newErrors.date = "Please select a date";
    if (!time) newErrors.time = "Please select a time";
    if (participants < 1) newErrors.participants = "At least 1 participant is required";
    if (!selectedCompany) newErrors.company = "Please select a company";
    return newErrors;
  }, [name, email, date, time, participants, selectedCompany]);

  const handleCreate = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const [hour, minute] = time.split(":").map(Number);
      const reservationDate = new Date(date);
      reservationDate.setHours(hour, minute);

      const reservation = {
        userId: user?.uid || null,
        userName: name,
        userEmail: email,
        companyId: selectedCompany,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        startDate: Timestamp.fromDate(reservationDate),
        createdAt: Timestamp.now(),
        participants,
        notes,
        location,
        price,
        status: "pending",
        paymentStatus: "unpaid",
      };

      await addDoc(collection(db, "reservations"), reservation);

      setInfoPopup({
        title: "✅ Reservation Created",
        message: `Your reservation on ${date} at ${time} was successfully created!`,
      });

      setDate("");
      setTime("12:00");
      setParticipants(1);
      setNotes("");
      setLocation("");
      setSelectedPlan(plans[0]);
      setErrors({});
    } catch (err) {
      console.error(err);
      setInfoPopup({
        title: "❌ Error",
        message: "Failed to create reservation. Please try again later.",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800">Create Reservation</h2>

      {/* Dropdown компаний */}
      <div>
        <div className="relative">
          <FaBuilding  />
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className={`pl-10 w-full border p-3 rounded-lg focus:ring focus:ring-blue-300 ${
              errors.company ? "border-red-500" : "border-gray-300"
            }`}
          >
            {companies.length > 0 ? (
              companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))
            ) : (
              <option disabled>No companies available</option>
            )}
          </select>
        </div>
        {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
      </div>

      <InputWithIcon
        icon={<FaUser />}
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />

      <InputWithIcon
        icon={<FaEnvelope />}
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />

      <div className="flex flex-col md:flex-row gap-4">
        <InputWithIcon
          icon={<FaCalendarAlt />}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
        />
        <InputWithIcon
          icon={<FaClock />}
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          error={errors.time}
        />
      </div>

      <InputWithIcon
        icon={<FaUser />}
        type="number"
        placeholder="Number of participants"
        value={participants}
        min={1}
        onChange={(e) => setParticipants(Number(e.target.value))}
        error={errors.participants}
      />

      <div>
        <select
          value={selectedPlan.id}
          onChange={(e) =>
            setSelectedPlan(plans.find((p) => p.id === e.target.value) || plans[0])
          }
          className="w-full border p-3 rounded-lg focus:ring focus:ring-blue-300"
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} ({plan.basePrice} €/participant)
            </option>
          ))}
        </select>
      </div>

      <InputWithIcon
        icon={<FaMapMarkerAlt />}
        placeholder="Location (optional)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <InputWithIcon
        icon={<FaStickyNote />}
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <p className="text-right font-semibold text-lg text-gray-700">
        Total Price: €{price}
      </p>

      <Button
        onClick={handleCreate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-lg transition-all"
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

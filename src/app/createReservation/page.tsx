"use client";

import { FC, useState, useEffect } from "react";
import { FaUser, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaStickyNote } from "react-icons/fa";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import InfoPopup from "@/components/InfoPopup";

interface Plan {
  id: string;
  name: string;
  basePrice: number;
}

const plans: Plan[] = [
  { id: "basic", name: "Basic", basePrice: 20 },
  { id: "premium", name: "Premium", basePrice: 40 },
  { id: "vip", name: "VIP", basePrice: 60 },
];

const CreateReservation: FC = () => {
  const [user, setUser] = useState<User | null>(null);
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

  useEffect(() => {
    setPrice(participants * selectedPlan.basePrice);
  }, [participants, selectedPlan]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name) newErrors.name = "Name is required";
    if (!email) newErrors.email = "Email is required";
    if (!date) newErrors.date = "Date is required";
    if (!time) newErrors.time = "Time is required";
    if (participants < 1) newErrors.participants = "At least 1 participant required";
    return newErrors;
  };

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

      await addDoc(collection(db, "reservations"), {
        userId: user?.uid || null,
        userName: name,
        userEmail: email,
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
      });

      setInfoPopup({
        title: "Reservation Created",
        message: `Reservation for ${name} on ${date} at ${time} has been successfully created!`,
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
        title: "Error",
        message: "Failed to create reservation. Please try again.",
      });
    }
  };

  const InputWithIcon = ({
    icon,
    ...props
  }: { icon: React.ReactNode } & React.ComponentProps<typeof Input>) => (
    <div className="relative mb-2">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
      <Input {...props} className="pl-10 w-full" />
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Reservation</h2>

      <InputWithIcon
        icon={<FaUser />}
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

      <InputWithIcon
        icon={<FaUser />}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

      <div className="flex gap-2">
        <InputWithIcon
          icon={<FaCalendarAlt />}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <InputWithIcon
          icon={<FaClock />}
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      {(errors.date || errors.time) && (
        <p className="text-red-500 text-sm">{errors.date || errors.time}</p>
      )}

      <InputWithIcon
        icon={<FaUser />}
        type="number"
        placeholder="Participants"
        value={participants}
        min={1}
        onChange={(e) => setParticipants(Number(e.target.value))}
      />
      {errors.participants && <p className="text-red-500 text-sm">{errors.participants}</p>}

      <div className="mb-2">
        <select
          value={selectedPlan.id}
          onChange={(e) =>
            setSelectedPlan(plans.find((p) => p.id === e.target.value) || plans[0])
          }
          className="w-full border p-2 rounded-lg"
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

      <p className="text-gray-600 font-medium text-right">Total Price: €{price}</p>

      <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700 mt-2">
        Create Reservation
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

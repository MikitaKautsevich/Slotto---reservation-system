"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, onSnapshot, addDoc, Timestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaClock,
  FaTag,
  FaStar,
  FaGlobe,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaCommentDots,
  FaArrowRight,
  FaChevronLeft,
  FaCalendarAlt,
} from "react-icons/fa";
import { db } from "@/lib/firebase";
import Button from "@/components/custom/Button";
import { Company } from "@/types/company";
import { Category } from "@/types/category";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";

export default function BookingPage() {
  const { companyId } = useParams();

  const [company, setCompany] = useState<Company | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [step, setStep] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientComment, setClientComment] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const generateTimeSlots = (open: string, close: string) => {
    const slots: string[] = [];
    if (!open || !close) return slots;
    let [h, m] = open.split(":").map(Number);
    const [endH, endM] = close.split(":").map(Number);
    while (h < endH || (h === endH && m < endM)) {
      slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
      m += 30;
      if (m >= 60) {
        h++;
        m = 0;
      }
    }
    return slots;
  };

  useEffect(() => {
    if (!companyId) return;
    const fetchCompany = async () => {
      const ref = doc(db, "companies", companyId as string);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) setCompany(snapshot.data() as Company);
      setLoading(false);
    };
    fetchCompany();

    const unsubCats = onSnapshot(collection(db, "companies", companyId as string, "categories"), (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
    });
    const unsubSrv = onSnapshot(collection(db, "companies", companyId as string, "services"), (snap) => {
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Service)));
    });
    const unsubEmp = onSnapshot(collection(db, "companies", companyId as string, "employees"), (snap) => {
      setEmployees(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Employee)));
    });
    return () => {
      unsubCats();
      unsubSrv();
      unsubEmp();
    };
  }, [companyId]);

  const handleBookingSubmit = async () => {
    if (
      !companyId ||
      !selectedService ||
      !selectedEmployee ||
      !clientName ||
      !clientEmail ||
      !clientPhone ||
      !agreeTerms ||
      !date ||
      !time
    )
      return alert("Please fill in all required fields and accept the terms.");

    setSaving(true);
    try {
      const ref = collection(db, "companies", companyId as string, "reservations");
      const service = services.find((s) => s.id === selectedService);
      await addDoc(ref, {
        clientName,
        clientEmail,
        clientPhone,
        clientComment,
        companyId,
        serviceName: service?.title || "",
        employeeId: selectedEmployee,
        startTime: Timestamp.fromDate(new Date(`${date}T${time}`)),
        endTime: Timestamp.fromDate(
          new Date(new Date(`${date}T${time}`).getTime() + (service?.duration || 60) * 60000)
        ),
        price: service?.price || 0,
        status: "pending",
        createdAt: Timestamp.fromDate(new Date()),
      });
      alert("✅ Booking confirmed!");
      setStep(1);
      setSelectedCategory(null);
      setSelectedService(null);
      setSelectedEmployee(null);
      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setClientComment("");
      setAgreeTerms(false);
      setDate("");
      setTime("");
    } catch (err) {
      console.error(err);
      alert("❌ Booking failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400 text-center mt-10">Loading...</p>;
  if (!company) return <p className="text-red-400 text-center mt-10">Company not found</p>;

  const timeSlots = generateTimeSlots(company.openTime || "09:00", company.closeTime || "18:00");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-100">
      {/* HERO */}
      <section className="w-full py-20 text-center text-white">
        <div className="max-w-5xl mx-auto px-6">
          {company.photoURL && (
            <img
              src={company.photoURL}
              alt={company.name}
              className="mx-auto w-44 h-44 rounded-full object-cover shadow-xl ring-4 ring-white/40 mb-6"
            />
          )}
          <h1 className="text-5xl font-extrabold mb-4">{company.name}</h1>
          <p className="text-lg opacity-90 mb-10">{company.description}</p>

          {/* Rating */}
          <div className="flex justify-center items-center gap-3 mb-4">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`text-2xl ${i < Math.round(company.rating || 0) ? "text-yellow-400" : "text-white/40"}`}
              />
            ))}
            <span className="text-lg font-semibold">{(company.rating || 0).toFixed(1)}</span>
            <span className="text-sm text-white/70">({company.totalRatings || 0} reviews)</span>
          </div>

          {company.web && (
            <a href={company.web} target="_blank" className="inline-block mt-4 text-blue-100 underline hover:text-white text-lg">
              {company.web}
            </a>
          )}
        </div>
      </section>

      {/* INFO */}
      <section className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-3 gap-8 text-gray-200">
        <div className="bg-gray-800/70 p-6 rounded-2xl shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-blue-400">
            <FaMapMarkerAlt /> Address
          </h3>
          <p>{company.address}</p>
        </div>

        <div className="bg-gray-800/70 p-6 rounded-2xl shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-blue-400">
            <FaClock /> Working Hours
          </h3>
          <p>{company.openTime} — {company.closeTime}</p>
        </div>

        <div className="bg-gray-800/70 p-6 rounded-2xl shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-blue-400">
            <FaTag /> Category
          </h3>
          <p>{company.category}</p>
        </div>
      </section>

      {/* EMPLOYEES */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-semibold text-blue-400 mb-8 text-center">Team</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 hover:border-blue-500 transition"
            >
              {/* Avatar */}
              {emp.photoURL ? (
                <img
                  src={emp.photoURL}
                  alt={emp.name}
                  className="w-38 h-38 rounded-full mx-auto mb-4 object-cover"
                />
              ) : (
                <div className="w-38 h-38 rounded-full mx-auto mb-4 bg-gray-700 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 20.25a8.25 8.25 0 0115 0"
                    />
                  </svg>
                </div>
              )}

              {/* Info */}
              <h3 className="text-xl font-bold text-center">{emp.name}</h3>
              <p className="text-center text-blue-400 mb-3">{emp.position}</p>
              {/* <p className="text-sm text-gray-300 text-center">{emp.bio}</p> */}

              {/* Services provided */}
              {emp.servicesIds?.length ? (
                <ul className="mt-3 text-sm text-center text-gray-400">
                  {services
                    .filter((s) => emp.servicesIds?.includes(s.id))
                    .map((srv) => (
                      <li key={srv.id}>• {srv.title}</li>
                    ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </section>


      {/* SERVICES */}
    <section className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-semibold text-blue-400 mb-8 text-center">Services</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center flex-wrap">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 hover:border-blue-500 transition flex flex-col justify-between w-full"
          >
            <div>
              <h4 className="text-xl font-semibold mb-2 text-blue-300">{srv.title}</h4>
              <p className="text-gray-300 mb-5 italic">{srv.description}</p>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-400 mt-4">
              <span>Duration: <b>{srv.duration}</b></span>
              <h2 className="text-blue-400 font-semibold">${srv.price}</h2>
            </div>
          </div>
        ))}
      </div>
    </section>


      {/* BOOKING SECTION */}
      <section className="max-w-5xl mx-auto pb-24 px-6">
        <h2 className="text-3xl font-semibold text-center text-blue-400 mb-12">Make a reservation</h2>
        <div className="bg-gray-800/70 p-10 rounded-3xl shadow-2xl border border-gray-700">
          <AnimatePresence mode="wait">
            {/* Step 1 - Category */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-400">
                  <FaTag /> Choose a Category
                </h3>
                <div className="flex flex-wrap gap-3">
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setStep(2);
                      }}
                      className="px-5 py-3 rounded-xl bg-gray-700 hover:bg-blue-600 transition"
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2 - Service */}
            {step === 2 && selectedCategory && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h3 className="text-xl font-bold mb-6 text-blue-400">Choose a Service</h3>
                <div className="flex flex-col gap-4">
                  {services
                    .filter((s) => s.category === selectedCategory)
                    .map((srv) => (
                      <Button
                        key={srv.id}
                        onClick={() => {
                          setSelectedService(srv.id);
                          setStep(3);
                        }}
                        className="w-full flex flex-col justify-between px-5 py-4 rounded-xl bg-gray-700 hover:bg-blue-600 transition"
                      >
                        {/* Верх: название и цена */}
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-white text-lg">{srv.title}</h4>
                          <span className="text-blue-300 font-semibold text-lg">${srv.price}</span>
                        </div>

                        {/* Описание */}
                        <p className="text-sm text-gray-300 mb-3">{srv.description}</p>

                        {/* Duration внизу */}
                        <span className="text-xs text-gray-400">Duration: {srv.duration}</span>
                      </Button>
                    ))}
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="mt-6 text-sm text-blue-400 flex items-center gap-1"
                >
                  <FaChevronLeft /> Back
                </button>
              </motion.div>
            )}


            {/* Step 3 - Employee */}
            {step === 3 && selectedService && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h3 className="text-xl font-bold mb-6 text-blue-400">Choose an Employee</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {employees
                    .filter((emp) => emp.servicesIds?.includes(selectedService))
                    .map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => {
                          setSelectedEmployee(emp.id);
                          setStep(4);
                        }}
                        className={`p-5 rounded-2xl border transition text-left ${
                          selectedEmployee === emp.id
                            ? "bg-blue-600 border-blue-400"
                            : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                        }`}
                      >
                        {emp.photoURL && (
                          <img src={emp.photoURL} alt={emp.name} className="w-20 h-20 rounded-full object-cover mb-3" />
                        )}
                        <h4 className="font-semibold text-lg">{emp.name}</h4>
                        <p className="text-sm text-blue-300">{emp.position}</p>
                        <p className="text-sm text-gray-300 mt-1">{emp.bio}</p>
                      </button>
                    ))}
                </div>
                <button onClick={() => setStep(2)} className="mt-6 text-sm text-blue-400 flex items-center gap-1">
                  <FaChevronLeft /> Back
                </button>
              </motion.div>
            )}

            {/* Step 4 - Client Info */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h3 className="text-xl font-bold mb-6 text-blue-400">Your Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="p-3 rounded-lg bg-gray-700 border border-gray-600"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="p-3 rounded-lg bg-gray-700 border border-gray-600"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="p-3 rounded-lg bg-gray-700 border border-gray-600"
                  />
                  <textarea
                    placeholder="Comment (Optional)"
                    value={clientComment}
                    onChange={(e) => setClientComment(e.target.value)}
                    className="p-3 rounded-lg bg-gray-700 border border-gray-600 md:col-span-2"
                  />
                </div>
                <label className="flex items-center gap-2 mt-4 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  I agree to the terms and privacy policy.
                </label>
                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(3)} className="text-blue-400 flex items-center gap-1">
                    <FaChevronLeft /> Back
                  </button>
                  <Button onClick={() => setStep(5)}>Next <FaArrowRight /></Button>
                </div>
              </motion.div>
            )}

            {/* Step 5 - Date & Time */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h3 className="text-xl font-bold mb-6 text-blue-400 flex items-center gap-2">
                  <FaCalendarAlt /> Choose Date & Time
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <input
                    type="date"
                    className="p-3 rounded-lg bg-gray-700 border border-gray-600"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="p-3 rounded-lg bg-gray-700 border border-gray-600"
                  >
                    <option value="">Select Time</option>
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(4)} className="text-blue-400 flex items-center gap-1">
                    <FaChevronLeft /> Back
                  </button>
                  <Button onClick={handleBookingSubmit} disabled={saving}>
                    {saving ? "Booking..." : "Confirm Booking"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

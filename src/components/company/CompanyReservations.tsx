"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

const SLOT_HEIGHT = 60;
const INTERVAL_MINUTES = 30;

// Палитра цветов для сотрудников
const COLORS = [
  "bg-blue-500", "bg-green-500", "bg-yellow-500",
  "bg-pink-500", "bg-purple-500", "bg-indigo-500",
  "bg-orange-500", "bg-teal-500",
];

function toDate(value: Timestamp | { seconds: number } | Date | string | null | undefined): Date | null {
  if (!value) return null;
  if (typeof (value as Timestamp).toDate === "function") return (value as Timestamp).toDate();
  if ((value as { seconds: number }).seconds) return new Date((value as { seconds: number }).seconds * 1000);
  return new Date(value as string | Date);
}

type Reservation = {
  id: string;
  startTime: Timestamp;
  endTime: Timestamp;
  clientName?: string;
  clientPhone?: string;
  serviceName?: string;
  status?: string;
  employeeId?: string;
  employeeName?: string;
  comment?: string;
  _start?: Date | null;
  _end?: Date | null;
};

type CompanyData = {
  openTime?: string;
  closeTime?: string;
};

export default function CompanyReservations({ companyId }: { companyId: string }) {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [employees, setEmployees] = useState<{id: string, name: string, color: string}[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Загрузка компании
  useEffect(() => {
    if (!companyId) return;
    const fetchCompany = async () => {
      const docRef = doc(db, "companies", companyId);
      const snap = await getDoc(docRef);
      if (snap.exists()) setCompany(snap.data() as CompanyData);
    };
    fetchCompany();
  }, [companyId]);

  // Загрузка сотрудников
  useEffect(() => {
    if (!companyId) return;
    const q = query(collection(db, "employees"), where("companyId", "==", companyId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d, i) => ({
        id: d.id,
        name: d.data().name || "Unnamed",
        color: COLORS[i % COLORS.length],
      }));
      setEmployees(list);
      setSelectedEmployees(list.map(e => e.id)); // по умолчанию все
    });
    return () => unsubscribe();
  }, [companyId]);

  // Загрузка резерваций
  useEffect(() => {
    if (!companyId) return;
    const q = query(collection(db, "reservations"), where("companyId", "==", companyId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ ...(d.data() as Reservation), id: d.id }));
      const normalized = list.map((r) => ({
        ...r,
        _start: toDate(r.startTime),
        _end: toDate(r.endTime),
      }));
      setReservations(normalized);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [companyId]);

  if (!company) return <div className="p-6 text-center">Loading company info…</div>;
  if (loading) return <div className="p-6 text-center">Loading reservations…</div>;

  const startHour = company.openTime ? parseInt(company.openTime.split(":")[0], 10) : 8;
  const endHour = company.closeTime ? parseInt(company.closeTime.split(":")[0], 10) : 22;
  const totalSlots = ((endHour - startHour) * 60) / INTERVAL_MINUTES;
  const calendarHeight = totalSlots * SLOT_HEIGHT;

  // Фильтрация по дате и выбранным сотрудникам
  const visibleReservations = reservations.filter(
    (r) =>
      r._start &&
      dayjs(r._start).format("YYYY-MM-DD") === date &&
      (!r.employeeId || selectedEmployees.includes(r.employeeId))
  );

  const prevDay = () => setDate(dayjs(date).subtract(1, "day").format("YYYY-MM-DD"));
  const nextDay = () => setDate(dayjs(date).add(1, "day").format("YYYY-MM-DD"));

  return (
    <div className="p-6">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Reservations</h1>
        <div className="flex flex-wrap gap-2 items-center">
          {employees.map(emp => (
            <button
              key={emp.id}
              onClick={() => {
                setSelectedEmployees(prev =>
                  prev.includes(emp.id) ? prev.filter(id => id !== emp.id) : [...prev, emp.id]
                );
              }}
              className={`px-3 py-1 rounded-full text-white text-sm font-medium transition
                ${selectedEmployees.includes(emp.id) ? emp.color : "bg-gray-300 text-gray-700"}`}
            >
              {emp.name}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-2">
            <button onClick={prevDay} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">‹</button>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border px-3 py-1 rounded"
            />
            <button onClick={nextDay} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">›</button>
          </div>
        </div>
      </div>

      <div className="overflow-auto border rounded-lg bg-white shadow-sm">
        <div className="grid" style={{ gridTemplateColumns: "80px 1fr" }}>
          {/* Часы */}
          <div className="bg-gray-50">
            <div style={{ height: 48 }} />
            <div style={{ height: calendarHeight }}>
              {Array.from({ length: totalSlots }).map((_, i) => {
                const totalMinutes = i * INTERVAL_MINUTES + startHour * 60;
                const hh = Math.floor(totalMinutes / 60);
                const mm = totalMinutes % 60;
                const label = `${String(hh).padStart(2, "0")}:${mm === 0 ? "00" : "30"}`;
                return (
                  <div
                    key={i}
                    style={{ height: SLOT_HEIGHT }}
                    className={`border-b border-gray-100 flex items-center justify-end pr-2 text-xs ${
                      mm === 0 ? "font-medium text-gray-600" : "text-gray-400"
                    }`}
                  >
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Основная область резерваций */}
          <div className="relative" style={{ minWidth: 700 }}>
            <div className="sticky top-0 z-10 bg-white border-b">
              <div className="p-3 font-medium">Reservations for {date}</div>
            </div>

            <div style={{ height: calendarHeight, position: "relative" }}>
              {/* Слоты */}
              {Array.from({ length: totalSlots }).map((_, i) => (
                <div
                  key={i}
                  style={{ height: SLOT_HEIGHT }}
                  className="border-b border-gray-100"
                />
              ))}

              {/* Резервации с цветом сотрудника и tooltip */}
              {visibleReservations.map((res) => {
                if (!res._start || !res._end) return null;
                const startMinutes = res._start.getHours() * 60 + res._start.getMinutes();
                const offset = startMinutes - startHour * 60;
                const topPx = (offset / INTERVAL_MINUTES) * SLOT_HEIGHT;
                const durationMin = Math.max(1, Math.round((res._end.getTime() - res._start.getTime()) / 60000));
                const heightPx = (durationMin / INTERVAL_MINUTES) * SLOT_HEIGHT;

                const emp = employees.find(e => e.id === res.employeeId);
                const bg = emp ? emp.color : "bg-gray-500";

                return (
                  <div
                    key={res.id}
                    className="absolute left-4 right-4 rounded-lg text-white shadow-md overflow-hidden cursor-pointer"
                    style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                    onMouseEnter={() => setHoveredId(res.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className={`p-2 text-sm ${bg}`}>
                      <div className="font-semibold truncate">{res.clientName || "Client"}</div>
                      <div className="truncate">{res.serviceName || ""}</div>
                      <div className="text-xs opacity-90">
                        {dayjs(res._start).format("HH:mm")} — {dayjs(res._end).format("HH:mm")}
                        {res.clientPhone ? ` • ${res.clientPhone}` : ""}
                      </div>
                    </div>

                    <AnimatePresence>
                      {hoveredId === res.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute left-full ml-2 top-0 w-64 bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-gray-800 z-50 pointer-events-none"
                        >
                          <div className="font-semibold mb-1">{res.clientName || "Client"}</div>
                          {res.clientPhone && <div className="text-sm mb-1">📞 {res.clientPhone}</div>}
                          {res.serviceName && <div className="text-sm mb-1">🛠 {res.serviceName}</div>}
                          {res.status && (
                            <div
                              className={`text-xs font-medium ${
                                res.status === "cancelled"
                                  ? "text-red-600"
                                  : res.status === "pending"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {res.status.toUpperCase()}
                            </div>
                          )}
                          {res.comment && <div className="text-sm mt-1 italic">💬 {res.comment}</div>}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

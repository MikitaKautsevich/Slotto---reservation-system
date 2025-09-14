"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, Query, DocumentData } from "firebase/firestore";
import dayjs from "dayjs";

const GRID_START_HOUR = 8;
const GRID_END_HOUR = 22;
const INTERVAL_MINUTES = 30;
const SLOT_HEIGHT = 40;

function toDate(value: any): Date | null {
  if (!value) return null;
  if (typeof value === "object" && typeof value.toDate === "function") {
    return value.toDate();
  }
  if (value && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }
  return new Date(value);
}

type Reservation = {
  id: string;
  startTime: any;
  endTime: any;
  companyId?: string;
  clientName?: string;
  clientPhone?: string;
  serviceName?: string;
  serviceId?: string;
  status?: string;
  _start?: Date | null;
  _end?: Date | null;
  [key: string]: any;
};

export default function ReservationsPage() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const qComp = query(collection(db, "companies"), where("ownerId", "==", user.uid));
        const snapComp = await getDocs(qComp);
        if (!snapComp.empty) {
          const compDoc = snapComp.docs[0];
          const cid = compDoc.id;
          setCompanyId(cid);
          await loadReservationsForCompany(cid);
        }
      } catch (err) {
        console.error("Load company/reservations error:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  async function loadReservationsForCompany(cid: string) {
    try {
      const q: Query<DocumentData> = query(collection(db, "reservations"), where("companyId", "==", cid));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ ...(d.data() as Reservation), id: d.id }));
      const normalized = list.map((r) => ({
        ...r,
        _start: toDate(r.startTime),
        _end: toDate(r.endTime),
      }));
      setReservations(normalized);
    } catch (err) {
      console.error("Failed to load reservations:", err);
      setReservations([]);
    }
  }

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // обновляем каждую минуту
    return () => clearInterval(timer);
  }, []);

  const visibleReservations = reservations.filter((r) => {
    if (!r._start || !r._end) return false;
    return dayjs(r._start).format("YYYY-MM-DD") === date;
  });

  const totalSlots = ((GRID_END_HOUR - GRID_START_HOUR) * 60) / INTERVAL_MINUTES;
  const calendarHeight = totalSlots * SLOT_HEIGHT;

  function prevDay() {
    setDate(dayjs(date).subtract(1, "day").format("YYYY-MM-DD"));
  }
  function nextDay() {
    setDate(dayjs(date).add(1, "day").format("YYYY-MM-DD"));
  }

  const isToday = dayjs(date).isSame(dayjs(), "day");
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowOffsetMinutes = nowMinutes - GRID_START_HOUR * 60;
  const nowTopPx = (nowOffsetMinutes / INTERVAL_MINUTES) * SLOT_HEIGHT;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h1 className="text-2xl font-bold">Reservations</h1>
        <div className="flex items-center gap-2">
          <button onClick={prevDay} className="px-3 py-1 bg-gray-100 rounded">‹</button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-3 py-1 rounded"
          />
          <button onClick={nextDay} className="px-3 py-1 bg-gray-100 rounded">›</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading…</div>
      ) : (
        <div className="overflow-auto border rounded-lg bg-white">
          <div className="grid" style={{ gridTemplateColumns: `80px 1fr` }}>
            {/* Левая колонка с часами */}
            <div className="bg-gray-50">
              <div style={{ height: 48 }} />
              <div style={{ height: calendarHeight }}>
                {Array.from({ length: totalSlots }).map((_, i) => {
                  const minutes = i * INTERVAL_MINUTES;
                  const hh = Math.floor(minutes / 60) + GRID_START_HOUR;
                  const mm = minutes % 60;
                  const label = mm === 0 ? `${String(hh).padStart(2, "0")}:00` : `${String(hh).padStart(2, "0")}:30`;
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

            {/* Основная колонка */}
            <div className="relative" style={{ minWidth: 700 }}>
              <div className="sticky top-0 z-10 bg-white border-b">
                <div className="p-3 font-medium">Reservations for {date}</div>
              </div>

              <div style={{ height: calendarHeight, position: "relative" }}>
                {Array.from({ length: totalSlots }).map((_, i) => {
                  const minutes = i * INTERVAL_MINUTES + GRID_START_HOUR * 60;
                  const isPast = isToday && minutes < nowMinutes;
                  return (
                    <div
                      key={i}
                      style={{ height: SLOT_HEIGHT }}
                      className={`border-b border-gray-100 ${isPast ? "bg-gray-50" : ""}`}
                    />
                  );
                })}

                {/* Текущая красная линия */}
                {isToday && nowOffsetMinutes >= 0 && nowOffsetMinutes <= (GRID_END_HOUR - GRID_START_HOUR) * 60 && (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-red-500"
                    style={{ top: `${nowTopPx}px` }}
                  >
                    <span className="absolute -top-2 left-0 bg-red-500 text-white text-xs px-2 rounded">
                      {dayjs(now).format("HH:mm")}
                    </span>
                  </div>
                )}

                {/* Резервации */}
                {visibleReservations.map((res) => {
                  if (!res._start || !res._end) return null;
                  const startMinutes = res._start.getHours() * 60 + res._start.getMinutes();
                  const offsetFromGridStart = Math.max(0, startMinutes - GRID_START_HOUR * 60);
                  const topPx = (offsetFromGridStart / INTERVAL_MINUTES) * SLOT_HEIGHT;
                  const durationMin = Math.max(1, Math.round((res._end.getTime() - res._start.getTime()) / 60000));
                  const heightPx = (durationMin / INTERVAL_MINUTES) * SLOT_HEIGHT;

                  const isPast = isToday && res._end < now;
                  const bg = isPast
                    ? "bg-gray-400"
                    : res.status === "cancelled"
                    ? "bg-red-500"
                    : res.status === "pending"
                    ? "bg-yellow-500"
                    : "bg-green-500";

                  return (
                    <div
                      key={res.id}
                      className={`absolute left-4 right-4 rounded-lg text-white shadow-md overflow-hidden ${bg}`}
                      style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                    >
                      <div className="p-2 text-sm">
                        <div className="font-semibold truncate">{res.clientName || "Client"}</div>
                        <div className="truncate">{res.serviceName || ""}</div>
                        <div className="text-xs opacity-90">
                          {dayjs(res._start).format("HH:mm")} — {dayjs(res._end).format("HH:mm")}
                          {res.clientPhone ? ` • ${res.clientPhone}` : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  momentLocalizer,
  SlotInfo,
  View,
  Event as RBCEvent,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const localizer = momentLocalizer(moment);

type RepeatMode = "once" | "weekly" | "range" | "customDays";

interface ScheduleDoc {
  events: RBCEvent[];
  dayOff?: boolean;
}

export default function EmployeeScheduleCalendar({
  companyId,
  employeeId,
}: {
  companyId: string;
  employeeId: string;
}) {
  const [events, setEvents] = useState<RBCEvent[]>([]);
  const [backgroundEvents, setBackgroundEvents] = useState<RBCEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>("week");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayEvents, setDayEvents] = useState<RBCEvent[]>([]);
  const [dayOff, setDayOff] = useState(false);

  const [eventType, setEventType] = useState<"LUNCH" | "BREAK">("LUNCH");
  const [eventStart, setEventStart] = useState<string>("12:00");
  const [eventEnd, setEventEnd] = useState<string>("12:30");

  const [repeatMode, setRepeatMode] = useState<RepeatMode>("once");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const [companyHours, setCompanyHours] = useState<{ open: string; close: string } | null>(null);

  const scheduleCollectionRef = collection(
    db,
    "companies",
    companyId,
    "employees",
    employeeId,
    "schedule"
  );

  const getDocIdForDate = (date: Date) => moment(date).format("YYYY-MM-DD");

  // Fetch company working hours
  useEffect(() => {
    const fetchCompanyHours = async () => {
      const docRef = doc(db, "companies", companyId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setCompanyHours({ open: data.openTime, close: data.closeTime });
      }
    };
    fetchCompanyHours();
  }, [companyId]);

  // Fetch week schedule
  const fetchScheduleForWeek = async (date: Date) => {
    if (!companyHours) return;

    const weekStart = moment(date).startOf("week");
    const weekEnd = moment(date).endOf("week");
    const weekEvents: RBCEvent[] = [];
    const dayOffs = new Set<string>();

    for (let day = weekStart.clone(); day.isSameOrBefore(weekEnd, "day"); day.add(1, "day")) {
      const docRef = doc(scheduleCollectionRef, getDocIdForDate(day.toDate()));
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as ScheduleDoc;
        if (data.dayOff) dayOffs.add(getDocIdForDate(day.toDate()));

        const savedEvents = data?.events?.map((e: any) => ({
          ...e,
          id: e.id || `${e.start}-${Math.random().toString(36).substring(2, 9)}`,
          start: e.start.toDate ? e.start.toDate() : new Date(e.start),
          end: e.end.toDate ? e.end.toDate() : new Date(e.end),
        })) || [];
        weekEvents.push(...savedEvents);
      }
    }

    setEvents(weekEvents);
    setBackgroundEvents(generateBackgroundEvents(date, dayOffs));
  };

  useEffect(() => {
    if (companyHours) fetchScheduleForWeek(currentDate);
  }, [currentDate, companyHours]);

  // Generate green background events
  const generateBackgroundEvents = (date: Date, dayOffs: Set<string>) => {
    if (!companyHours) return [];
    const weekStart = moment(date).startOf("week");
    const weekEnd = moment(date).endOf("week");
    const bgEvents: RBCEvent[] = [];

    for (let day = weekStart.clone(); day.isSameOrBefore(weekEnd, "day"); day.add(1, "day")) {
      if (dayOffs.has(day.format("YYYY-MM-DD"))) continue;
      const [openHour, openMin] = companyHours.open.split(":").map(Number);
      const [closeHour, closeMin] = companyHours.close.split(":").map(Number);
      bgEvents.push({
        id: `WORK-${day.format("YYYY-MM-DD")}`,
        title: "WORK",
        start: day.clone().hour(openHour).minute(openMin).toDate(),
        end: day.clone().hour(closeHour).minute(closeMin).toDate(),
        allDay: false,
      });
    }
    return bgEvents;
  };

  // Open modal for date
  const openDayModal = async (date: Date) => {
    setSelectedDate(date);
    const docRef = doc(scheduleCollectionRef, getDocIdForDate(date));
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as ScheduleDoc;
      setDayEvents(data.events || []);
      setDayOff(data.dayOff || false);
    } else {
      setDayEvents([]);
      setDayOff(false);
    }
    setModalOpen(true);
  };

  // Add new event
  const addEvent = () => {
    if (!selectedDate) return;
    const start = moment(selectedDate).hour(+eventStart.split(":")[0]).minute(+eventStart.split(":")[1]).toDate();
    const end = moment(selectedDate).hour(+eventEnd.split(":")[0]).minute(+eventEnd.split(":")[1]).toDate();
    const newEvent = { id: `${Date.now()}-${eventType}`, title: eventType, start, end, allDay: false };
    setDayEvents((prev) => [...prev, newEvent]);
  };

  // Delete event
  const deleteEvent = (id: string) => {
    setDayEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Toggle type
  const toggleType = (id: string) => {
    setDayEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, title: e.title === "LUNCH" ? "BREAK" : "LUNCH" } : e))
    );
  };

  // Save schedule
  const saveDay = async () => {
    if (!selectedDate) return;
    const docRef = doc(scheduleCollectionRef, getDocIdForDate(selectedDate));
    await setDoc(docRef, { events: dayEvents, dayOff });
    setModalOpen(false);
    fetchScheduleForWeek(currentDate);
  };

  return (
    <div className="p-4 border rounded-xl shadow bg-white">
      <Calendar
        localizer={localizer}
        events={events}
        backgroundEvents={backgroundEvents}
        eventPropGetter={(e) => ({
          style: {
            backgroundColor: e.title === "LUNCH" ? "#facc15" : e.title === "BREAK" ? "#fb923c" : "#3b82f6",
            borderRadius: "6px",
          },
        })}
        backgroundEventPropGetter={() => ({ style: { backgroundColor: "#4ade80", opacity: 0.25 } })}
        selectable
        onSelectSlot={(slot) => openDayModal(slot.start)}
        onSelectEvent={(e) => openDayModal(e.start)}
        defaultView="week"
        date={currentDate}
        onNavigate={(d) => setCurrentDate(d)}
        view={view}
        onView={(v) => setView(v)}
        style={{ height: "75vh" }}
      />

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[500px]">
            <h3 className="text-lg font-semibold mb-4">
              Schedule for {selectedDate && moment(selectedDate).format("YYYY-MM-DD")}
            </h3>

            {/* Toggle workday */}
            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" checked={!dayOff} onChange={() => setDayOff(!dayOff)} />
              Working day
            </label>

            {/* Events list */}
            <ul className="mb-4">
              {dayEvents.map((e) => (
                <li key={e.id} className="flex justify-between items-center mb-2">
                  <span>
                    {moment(e.start).format("HH:mm")} - {moment(e.end).format("HH:mm")} ({e.title})
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => toggleType(e.id as string)} className="px-2 py-1 bg-blue-100 rounded">
                      Toggle
                    </button>
                    <button onClick={() => deleteEvent(e.id as string)} className="px-2 py-1 bg-red-100 rounded">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Add event */}
            <div className="flex gap-2 mb-4">
              <select value={eventType} onChange={(e) => setEventType(e.target.value as "LUNCH" | "BREAK")}>
                <option value="LUNCH">Lunch</option>
                <option value="BREAK">Break</option>
              </select>
              <input type="time" value={eventStart} onChange={(e) => setEventStart(e.target.value)} />
              <input type="time" value={eventEnd} onChange={(e) => setEventEnd(e.target.value)} />
              <button onClick={addEvent} className="px-2 py-1 bg-green-200 rounded">
                Add
              </button>
            </div>

            {/* Repeat options */}
            <div className="mb-4">
              <label>Repeat:</label>
              <select value={repeatMode} onChange={(e) => setRepeatMode(e.target.value as RepeatMode)}>
                <option value="once">Once</option>
                <option value="weekly">Weekly</option>
                <option value="range">Date Range</option>
                <option value="customDays">Custom Days</option>
              </select>
              {repeatMode === "range" && (
                <div className="flex gap-2 mt-2">
                  <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} />
                  <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} />
                </div>
              )}
              {repeatMode === "customDays" && (
                <div className="flex gap-2 mt-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                    <label key={d}>
                      <input
                        type="checkbox"
                        checked={selectedDays.includes(d)}
                        onChange={() =>
                          setSelectedDays((prev) =>
                            prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
                          )
                        }
                      />
                      {moment().day(d).format("ddd")}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Save / Cancel */}
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">
                Cancel
              </button>
              <button onClick={saveDay} className="px-4 py-2 bg-blue-500 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

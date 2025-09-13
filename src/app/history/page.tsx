"use client";

import { FC, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaFilter, FaDownload } from "react-icons/fa";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Reservation {
  id: string;
  planName: string;
  startDate: Date;
  participants: number;
  location?: string;
  notes?: string;
  price: number;
  status: string;
}

const PAGE_SIZE = 5;

const History: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [filters, setFilters] = useState({ plan: "", status: "", search: "" });
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [showDetails, setShowDetails] = useState<Reservation | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchReservations(true);
  }, [user, filters, sortOrder]);

  const fetchReservations = async (reset = false) => {
    if (!user) return;
    setLoading(true);

    try {
      const now = new Date();
      let q = query(
        collection(db, "reservations"),
        where("userId", "==", user.uid),
        orderBy("startDate", sortOrder),
        limit(PAGE_SIZE)
      );

      if (!reset && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);

      let list: Reservation[] = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            planName: data.planName,
            startDate: data.startDate.toDate(),
            participants: data.participants,
            location: data.location,
            notes: data.notes,
            price: data.price,
            status: data.status,
          };
        })

      //   .filter((r) => r.startDate < now);

      // фильтрация
      if (filters.plan) list = list.filter((r) => r.planName === filters.plan);
      if (filters.status) list = list.filter((r) => r.status === filters.status);
      if (filters.search)
        list = list.filter(
          (r) =>
            r.location?.toLowerCase().includes(filters.search.toLowerCase()) ||
            r.notes?.toLowerCase().includes(filters.search.toLowerCase())
        );

      setReservations(reset ? list : [...reservations, ...list]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
    } catch (err) {
      console.error("Error loading reservations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = reservations
      .map(
        (r) =>
          `${r.planName},${r.startDate.toISOString()},${r.participants},${r.location || ""},${
            r.notes || ""
          },${r.price},${r.status}`
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reservation-history.csv";
    link.click();
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold">Reservation History</h2>

      {/* Фильтры */}
      <div className="grid md:grid-cols-4 gap-2">
        <select
          value={filters.plan}
          onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
          className="border p-2 rounded-lg"
        >
          <option value="">All Plans</option>
          <option value="Basic">Basic</option>
          <option value="Premium">Premium</option>
          <option value="VIP">VIP</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border p-2 rounded-lg"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Input
          placeholder="Search (location/notes)"
          value={filters.search}
          onChange={(e: { target: { value: any; }; }) => setFilters({ ...filters, search: e.target.value })}
        />
        <Button
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
        >
          <FaFilter  />
          {sortOrder === "desc" ? "Newest First" : "Oldest First"}
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : reservations.length === 0 ? (
        <p className="text-gray-500">No past reservations found.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => setShowDetails(res)}
            >
              <h3 className="text-lg font-semibold text-gray-800 flex justify-between">
                {res.planName}
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    res.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : res.status === "canceled"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {res.status}
                </span>
              </h3>
              <div className="text-sm text-gray-600 space-y-1 mt-2">
                <p className="flex items-center gap-2">
                  <FaCalendarAlt /> {res.startDate.toLocaleDateString()}{" "}
                  <FaClock />{" "}
                  {res.startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="flex items-center gap-2">
                  <FaUsers /> {res.participants} participant(s)
                </p>
                {res.location && (
                  <p className="flex items-center gap-2">
                    <FaMapMarkerAlt /> {res.location}
                  </p>
                )}
              </div>
              <p className="mt-2 font-semibold text-gray-800">€{res.price}</p>
            </div>
          ))}

          {lastVisible && (
            <Button onClick={() => fetchReservations(false)} className="w-full">
              Load More
            </Button>
          )}
        </div>
      )}

      {reservations.length > 0 && (
        <Button onClick={handleExport} className="w-full mt-2">
          <FaDownload /> Export CSV
        </Button>
      )}

      {/* Модалка с деталями */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-lg">
            <h3 className="text-xl font-bold mb-2">{showDetails.planName}</h3>
            <p>
              <strong>Date:</strong> {showDetails.startDate.toLocaleString()}
            </p>
            <p>
              <strong>Participants:</strong> {showDetails.participants}
            </p>
            {showDetails.location && <p><strong>Location:</strong> {showDetails.location}</p>}
            {showDetails.notes && <p><strong>Notes:</strong> {showDetails.notes}</p>}
            <p className="font-semibold text-lg mt-2">Total: €{showDetails.price}</p>
            <Button className="mt-4 w-full" onClick={() => setShowDetails(null)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;

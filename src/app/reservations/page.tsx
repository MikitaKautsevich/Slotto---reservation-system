'use client';

import { FC, useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, doc, getDocs, query, where, updateDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Popup from "@/components/Popup";
import InfoPopup from "@/components/InfoPopup";
import { FaTimes, FaEdit } from "react-icons/fa";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface Reservation {
  id: string;
  userId: string;
  planName: string;
  startDate: any;
  participants: number;
  location?: string;
  notes?: string;
  price: number;
  status: "pending" | "confirmed" | "cancelled";
}

interface Company {
  id: string;
  name: string;
}

const Reservations: FC = () => {
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [popupData, setPopupData] = useState<{ title: string; message: string; onConfirm?: () => void } | null>(null);
  const [infoPopup, setInfoPopup] = useState<{ title: string; message: string } | null>(null);

  const [editReservation, setEditReservation] = useState<Reservation | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editParticipants, setEditParticipants] = useState(1);
  const [editLocation, setEditLocation] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchReservations(u.uid);
        await fetchCompanies();
      }
    });
    return unsubscribe;
  }, []);

  const fetchReservations = async (uid: string) => {
    try {
      const q = query(collection(db, "reservations"), where("userId", "==", uid));
      const snapshot = await getDocs(q);
      const res: Reservation[] = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Reservation))
        .filter((res) => res.status !== "cancelled");
      setReservations(res);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const snapshot = await getDocs(collection(db, "companies"));
      const comps: Company[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
      setCompanies(comps);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelClick = (res: Reservation) => {
    const resDate = res.startDate.toDate();
    const diffHours = (resDate.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    const canCancel = diffHours >= 24;

    if (!canCancel) {
      setInfoPopup({ title: "Cannot cancel", message: "You can only cancel reservations at least 24 hours in advance." });
      return;
    }

    setPopupData({
      title: "Cancel Reservation?",
      message: "Are you sure you want to cancel this reservation?",
      onConfirm: async () => {
        try {
          const resDocRef = doc(db, "reservations", res.id);
          await updateDoc(resDocRef, { status: "cancelled" });
          setReservations(prev => prev.filter(r => r.id !== res.id));
          setInfoPopup({ title: "Reservation Cancelled", message: "Your reservation has been cancelled." });
        } catch (err) {
          console.error(err);
          setInfoPopup({ title: "Error", message: "Failed to cancel reservation. Please try again." });
        }
      }
    });
  };

  const handleEditClick = (res: Reservation) => {
    const resDate = res.startDate.toDate();
    setEditReservation(res);
    setEditDate(resDate.toISOString().substring(0, 10));
    setEditParticipants(res.participants);
    setEditLocation(res.location || "");
    setEditNotes(res.notes || "");
  };

  const handleEditSave = async () => {
    if (!editReservation || !user) return;

    try {
      const newTimestamp = Timestamp.fromDate(new Date(editDate));
      const resDocRef = doc(db, "reservations", editReservation.id);
      await updateDoc(resDocRef, {
        startDate: newTimestamp,
        participants: editParticipants,
        location: editLocation,
        notes: editNotes
      });

      setReservations(prev => prev.map(r => r.id === editReservation.id ? { ...r, startDate: newTimestamp, participants: editParticipants, location: editLocation, notes: editNotes } : r));

      setInfoPopup({ title: "Reservation Updated", message: "Your reservation has been updated." });
      setEditReservation(null);
    } catch (err) {
      console.error(err);
      setInfoPopup({ title: "Error", message: "Failed to update reservation." });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h2 className="text-3xl font-bold text-center mb-4">Your Reservations</h2>
      {reservations.length === 0 && <p className="text-center text-gray-500">No active reservations found.</p>}
      {reservations.map((res) => {
        const resDate = res.startDate.toDate();
        const diffHours = (resDate.getTime() - new Date().getTime()) / (1000 * 60 * 60);
        const canCancel = true

        return (
          <div key={res.id} className="relative border rounded-xl p-4 md:p-6 flex flex-col md:flex-row md:justify-between bg-gray-50 shadow-sm hover:shadow-md transition">
            <div>
              <p className="font-semibold text-lg">{res.planName}</p>
              <p className="text-gray-600">Date: {resDate.toLocaleDateString()}</p>
              <p className="text-gray-600">Time: {resDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-gray-600">Participants: {res.participants}</p>
              {res.location && <p className="text-gray-600">Location: {res.location}</p>}
              {res.notes && <p className="text-gray-600">Notes: {res.notes}</p>}
            </div>
            <div className="flex flex-col items-end gap-2 mt-2 md:mt-0">
              <p className="font-medium text-right">Price: €{res.price}</p>
              <p className={`font-semibold ${res.status === "pending" ? "text-yellow-600" : "text-green-600"}`}>
                {res.status}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEditClick(res)}
                  className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                  title="Edit Reservation"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleCancelClick(res)}
                  disabled={!canCancel}
                  className={`p-2 rounded-full text-white ${canCancel ? "bg-red-600 hover:bg-red-700" : "bg-gray-400 cursor-not-allowed"}`}
                  title={canCancel ? "Cancel Reservation" : "Cannot cancel less than 24h before"}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Popup для редактирования */}
      {editReservation && (
        <Popup
          title={`Edit Reservation: ${editReservation.planName}`}
          message={
            <div className="space-y-2">
              <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
              <Input type="number" value={editParticipants} min={1} onChange={(e) => setEditParticipants(Number(e.target.value))} />
              <select value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full p-2 border rounded-md">
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <Input type="text" placeholder="Notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
            </div>
          }
          onClose={() => setEditReservation(null)}
          onConfirm={handleEditSave}
        />
      )}

      {popupData && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          onClose={() => setPopupData(null)}
          onConfirm={() => {
            if (popupData.onConfirm) {
              popupData.onConfirm();
            }
            setPopupData(null);
          }}
        />
      )}

      {infoPopup && <InfoPopup title={infoPopup.title} message={infoPopup.message} onClose={() => setInfoPopup(null)} />}
    </div>
  );
};

export default Reservations;

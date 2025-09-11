'use client';

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Button from "@/components/ui/Button";

enum Tab {
  Profile = "Profile",
  CreateReservation = "Create Reservation",
  Reservations = "Reservations",
  History = "History",
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Profile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <p className="text-center mt-10">Please log in first.</p>;

  const renderTabContent = () => {
    switch (activeTab) {
      case Tab.Profile:
        if (!userData) return <p>No user data found.</p>;
        return (
          <div className="space-y-2">
            {Object.entries(userData).map(([key, value]) => (
            <p key={key}>
                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
                {JSON.stringify(value)}
            </p>
            ))}
          </div>
        );

      case Tab.CreateReservation:
        return (
          <div>
            <p>Create a new reservation here.</p>
          </div>
        );

      case Tab.Reservations:
        return (
          <div>
            <p>List of current reservations.</p>
          </div>
        );

      case Tab.History:
        return (
          <div>
            <p>Reservation history.</p>
          </div>
        );

      default:
        return null;
    }
  };

  const tabs = [Tab.Profile, Tab.CreateReservation, Tab.Reservations, Tab.History];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>

      <div className="flex border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px font-medium border-b-2 transition ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 border rounded-lg shadow-sm bg-white">
        {renderTabContent()}
      </div>
    </div>
  );
}

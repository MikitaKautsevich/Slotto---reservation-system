"use client";

import { useState, useEffect, useRef, SetStateAction } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";

const categories = [
  "Darčekové poukážky",
  "Vlasy",
  "Brada",
  "Komplet"
];

export default function CompanyServicesTab() {
  const [user, setUser] = useState<User | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [services, setServices] = useState<any[]>([]);

  // Форма нового сервиса
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, "companies"), where("ownerId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const companyDoc = querySnapshot.docs[0];
          setCompanyId(companyDoc.id);
          await loadServices(companyDoc.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadServices = async (companyId: string) => {
    const q = query(collection(db, "companies", companyId, "services"));
    const snapshot = await getDocs(q);
    const data: any[] = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    setServices(data);
  };

  const handleAddService = async () => {
    if (!companyId) return;
    setSaving(true);

    try {
      const newService = {
        category,
        title,
        description,
        duration,
        price,
        createdAt: new Date(),
      };
      const docRef = await addDoc(collection(db, "companies", companyId, "services"), newService);
      setServices([...services, { id: docRef.id, ...newService }]);
      setCategory("");
      setTitle("");
      setDescription("");
      setDuration("");
      setPrice("");
    } catch (err) {
      console.error(err);
      alert("Failed to add service");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!companyId) return;
    await deleteDoc(doc(db, "companies", companyId, "services", serviceId));
    setServices(services.filter((s) => s.id !== serviceId));
  };

  if (loading) return <p className="text-gray-500 text-center mt-10">Loading services...</p>;
  if (!user) return <p className="text-red-500 text-center mt-10">Please log in to view services.</p>;

  return (
    <div className="w-full p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Add New Service</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Category</label>
            <Select value={category} onChange={(e: { target: { value: SetStateAction<string>; }; }) => setCategory(e.target.value)} options={categories} />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Service Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Service Title" />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Service Description" className="h-24" />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Duration</label>
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 30min, 1h" />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Price (€)</label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
          </div>
        </div>

        <Button
          onClick={handleAddService}
          className={`bg-blue-600 text-white w-full ${saving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"}`}
          disabled={saving}
        >
          {saving ? "Saving..." : "Add Service"}
        </Button>
      </div>

      {/* List of services */}
      <div className="mt-8 space-y-4">
        {services.map((service) => (
          <div key={service.id} className="bg-gray-50 rounded-xl p-4 flex justify-between items-start shadow-sm">
            <div>
              <p className="font-semibold text-gray-800">{service.title}</p>
              <p className="text-gray-600">{service.description}</p>
              <p className="text-gray-500 text-sm">{service.category} | {service.duration} | €{service.price}</p>
            </div>
            <button
              onClick={() => handleDeleteService(service.id)}
              className="text-red-600 font-bold hover:text-red-800"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

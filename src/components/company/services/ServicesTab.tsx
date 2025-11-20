"use client";

import { useState, useEffect, SetStateAction } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Input from "@/components/custom/Input";
import Button from "@/components/custom/Button";
import Textarea from "@/components/custom/Textarea";
import Select from "@/components/custom/Select";
import Popup from "../../custom/Popup";
import InfoPopup from "../../custom/InfoPopup";
import { Service } from "@/types/service";
import { Loading } from "@/app/Loading";
import { Category } from "@/types/category";
import { InfoMessage } from "@/components/custom/InfoMessage";

export const ServicesTab = ({ companyId }: { companyId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");

  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [infoPopup, setInfoPopup] = useState<{ title: string; message: string } | null>(null);
  const [confirmPopup, setConfirmPopup] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Auth + subscriptions
  useEffect(() => {
    if (!companyId) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const servicesRef = collection(db, "companies", companyId, "services");
      const unsubscribeServices = onSnapshot(servicesRef, (snapshot) => {
        const data: Service[] = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Service));
        setServices(data);
      });

      const categoriesRef = collection(db, "companies", companyId, "categories");
      const unsubscribeCategories = onSnapshot(categoriesRef, (snapshot) => {
        const data: Category[] = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Category));
        setCategories(data);
      });

      setLoading(false);

      return () => {
        unsubscribeServices();
        unsubscribeCategories();
      };
    });

    return () => unsubscribeAuth();
  }, [companyId]);

  // --- Firestore actions (same logic as your original) ---
  const handleAddService = async () => {
    if (!companyId || !category) return;
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

      if (!services.some((serv) => serv.title === title)) {
        await addDoc(collection(db, "companies", companyId, "services"), newService);
      }

      setCategory("");
      setTitle("");
      setDescription("");
      setDuration("");
      setPrice("");
      setInfoPopup({ title: "Success", message: "Service added successfully ✅" });
    } catch (err) {
      console.error(err);
      setInfoPopup({ title: "Error", message: "Failed to add service ❌" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (id: string, title: string) => {
    if (!companyId) return;
    setConfirmPopup({
      title: "Delete Service?",
      message: `Are you sure you want to delete "${title}"?`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "companies", companyId, "services", id));
          setInfoPopup({ title: "Deleted", message: "Service deleted ✅" });
        } catch (err) {
          console.error(err);
          setInfoPopup({ title: "Error", message: "Failed to delete service ❌" });
        } finally {
          setConfirmPopup(null);
        }
      },
    });
  };

  const handleAddCategory = async () => {
    if (!companyId || !newCategory.trim()) return;
    try {
      if (categories.some((c) => c.name.toLowerCase() === newCategory.trim().toLowerCase())) {
        setInfoPopup({ title: "Error", message: "Category already exists ❌" });
        return;
      }

      await addDoc(collection(db, "companies", companyId, "categories"), {
        name: newCategory.trim(),
        createdAt: new Date(),
      });
      setNewCategory("");
      setInfoPopup({ title: "Success", message: "Category added ✅" });
    } catch (err) {
      console.error(err);
      setInfoPopup({ title: "Error", message: "Failed to add category ❌" });
    }
  };

  const handleUpdateCategory = async () => {
    if (!companyId || !editingCategory) return;
    try {
      const { id, name, oldName } = editingCategory;
      const catRef = doc(db, "companies", companyId, "categories", id);
      await updateDoc(catRef, { name });
      const q = query(collection(db, "companies", companyId, "services"), where("category", "==", oldName));
      const snapshot = await getDocs(q);
      for (const s of snapshot.docs) {
        await updateDoc(doc(db, "companies", companyId, "services", s.id), { category: name });
      }
      setEditingCategory(null);
      setInfoPopup({ title: "Updated", message: "Category renamed ✅" });
    } catch (err) {
      console.error(err);
      setInfoPopup({ title: "Error", message: "Failed to update category ❌" });
    }
  };

  const handleUpdateService = async () => {
    if (!companyId || !editingService) return;
    try {
      const ref = doc(db, "companies", companyId, "services", editingService.id);
      await updateDoc(ref, editingService);
      setEditingService(null);
      setInfoPopup({ title: "Updated", message: "Service updated ✅" });
    } catch (err) {
      console.error(err);
      setInfoPopup({ title: "Error", message: "Failed to update service ❌" });
    }
  };

    const handleDeleteCategory = async (category: Category) => {
    if (!companyId) return;

    setConfirmPopup({
      title: "Delete Category?",
      message: `Are you sure you want to delete category "${category.name}"? All services linked to this category will also be deleted.`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "companies", companyId, "categories", category.id));

          const servicesRef = collection(db, "companies", companyId, "services");
          const q = query(servicesRef, where("category", "==", category.name));
          const snapshot = await getDocs(q);
          for (const s of snapshot.docs) {
            await deleteDoc(doc(db, "companies", companyId, "services", s.id));
          }

          setInfoPopup({ title: "Deleted", message: "Category and linked services deleted ✅" });
        } catch (err) {
          console.error(err);
          setInfoPopup({ title: "Error", message: "Failed to delete category ❌" });
        } finally {
          setConfirmPopup(null);
        }
      },
    });
  };
  // --- Render ---
  if (loading) return <Loading />;
  if (!user)
    return <InfoMessage
              type="info"
              title="Not Logged In"
              message="Please log in to view your dashboard"
            />
  return (
    <div className="p-6 lg:p-10 rounded-2xl shadow-sm border border-gray-100 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Services Management</h2>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            selectedCategory === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedCategory === cat.name
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services List */}
      {services.length === 0 ?
        <InfoMessage
          type="info"
          title="No Services Found"
          message="You don’t have any services yet."
        />
      :
        <div className="space-y-4 mb-10">
          {services.filter((s) => selectedCategory === "all" || s.category === selectedCategory)
            .map((service) => (
              <div
                key={service.id}
                className="bg-gray-50 border border-gray-100 rounded-xl p-5 flex justify-between items-start hover:shadow-md transition"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{service.title}</h3>
                  <p className="text-gray-600 mt-1">{service.description}</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {service.category} | {service.duration} | €{service.price}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setEditingService(service)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteService(service.id, service.title)}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
        </div>
      }
      
      {/* Manage Categories */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
        <div className="flex gap-2 mb-4">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New Category"
          />
          <Button onClick={handleAddCategory} className="bg-green-600 hover:bg-green-700 text-white">
            Add
          </Button>
        </div>

        {categories.length === 0 ? (
          <InfoMessage
            type="info"
            title="No Categories Found"
            message="Please add a category to start adding services."
          />
        ) :         <div className="flex flex-wrap gap-3">
          
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl flex items-center gap-3 shadow-sm"
            >
              <span className="font-medium text-gray-700">{cat.name}</span>
              <Button
                onClick={() => setEditingCategory({ id: cat.id, name: cat.name, oldName: cat.name })}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDeleteCategory(cat)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
        }
      </div>

      {/* Add New Service */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Add New Service</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Category</label>
            <Select
              value={category}
              onChange={(e: { target: { value: SetStateAction<string> } }) =>
                setCategory(e.target.value)
              }
              options={categories.map((c) => c.name)}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Service Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Service Title"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the service..."
              className="h-24"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Duration</label>
            <Input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 30min, 1h"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Price (€)</label>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
            />
          </div>
        </div>

        <div className="pt-6">
          <Button
            onClick={handleAddService}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              saving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={saving}
          >
            {saving ? "Saving..." : "Add Service"}
          </Button>
        </div>
      </div>

      {/* Popups */}
      {infoPopup && (
        <InfoPopup title={infoPopup.title} message={infoPopup.message} onClose={() => setInfoPopup(null)} />
      )}
      {confirmPopup && (
        <Popup
          title={confirmPopup.title}
          message={confirmPopup.message}
          onConfirm={confirmPopup.onConfirm}
          onClose={() => setConfirmPopup(null)}
        />
      )}
      {editingCategory && (
        <Popup
          title="Edit Category"
          message={
            <Input
              value={editingCategory.name}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, name: e.target.value })
              }
            />
          }
          onConfirm={handleUpdateCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
      {editingService && (
        <Popup
          title="Edit Service"
          message={
            <div className="space-y-3">
              <Input
                value={editingService.title}
                onChange={(e) =>
                  setEditingService({ ...editingService, title: e.target.value })
                }
                placeholder="Service Title"
              />
              <Textarea
                value={editingService.description}
                onChange={(e) =>
                  setEditingService({ ...editingService, description: e.target.value })
                }
                placeholder="Description"
                className="h-20"
              />
              <Input
                value={editingService.duration}
                onChange={(e) =>
                  setEditingService({ ...editingService, duration: e.target.value })
                }
                placeholder="Duration"
              />
              <Input
                value={editingService.price}
                onChange={(e) =>
                  setEditingService({ ...editingService, price: e.target.value })
                }
                placeholder="Price"
              />
              <Select
                value={editingService.category}
                onChange={(e: { target: { value: SetStateAction<string> } }) =>
                  setEditingService({ ...editingService, category: e.target.value })
                }
                options={categories.map((c) => c.name)}
              />
            </div>
          }
          onConfirm={handleUpdateService}
          onClose={() => setEditingService(null)}
        />
      )}
    </div>
  );
};

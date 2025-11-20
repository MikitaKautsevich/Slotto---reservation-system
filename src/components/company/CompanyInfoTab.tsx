"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { db, auth } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Input from "@/components/custom/Input";
import Button from "@/components/custom/Button";
import Textarea from "@/components/custom/Textarea";

export default function CompanyInfoTab({ companyId }: { companyId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [web, setWeb] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [photoURL, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!companyId) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const companyRef = doc(db, "companies", companyId);
      const unsubscribeCompany = onSnapshot(
        companyRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setName(data.name || "");
            setAddress(data.address || "");
            setWeb(data.web || "");
            setCategory(data.category || "");
            setDescription(data.description || "");
            setPhotoUrl(data.photoURL || null);
            setLastUpdated(data.updatedAt?.toDate ? data.updatedAt.toDate() : null);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error listening company:", error);
          setLoading(false);
        }
      );

      return unsubscribeCompany;
    });

    return () => unsubscribeAuth();
  }, [companyId]);

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleSave = async () => {
    if (!user || !companyId) return;
    setSaving(true);

    try {
      let finalBase64 = photoURL;

      if (photoFile) {
        finalBase64 = await fileToBase64(photoFile);
        setPhotoUrl(finalBase64);
      }

      await updateDoc(doc(db, "companies", companyId), {
        name,
        address,
        web,
        category,
        description,
        photoURL: finalBase64,
        updatedAt: new Date(),
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error(error);
      alert("Failed to save company info.");
    } finally {
      setSaving(false);
      setEditingDesc(false);
    }
  };

  const handleFileChange = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoUrl(null);
  };

  if (loading) return <p className="text-gray-500 text-center mt-10">Loading company info...</p>;
  if (!user) return <p className="text-red-500 text-center mt-10">Please log in to view company info.</p>;

  return (
    <div className="p-6 lg:p-10 rounded-2xl shadow-sm border border-gray-100 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
        <div
          className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden group hover:border-blue-500 transition cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {photoURL ? (
            <>
              <Image
                src={photoURL}
                alt="Company"
                width={128}
                height={128}
                className="w-full h-full object-cover rounded-xl transition-transform duration-200 group-hover:scale-105"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto();
                }}
                type="button"
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md transition"
              >
                ×
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <svg
                className="w-8 h-8 mb-1 text-gray-300 group-hover:text-blue-500 transition"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs">Upload Logo</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            className="hidden"
          />
        </div>

        {/* Company Summary */}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-800">{name || "Unnamed Company"}</h2>
          <p className="text-gray-500 text-sm mt-1">{category || "Uncategorized"}</p>
          <p className="text-blue-600 mt-2 font-medium">
            {web ? <a href={web} target="_blank" rel="noopener noreferrer">{web}</a> : "No website yet"}
          </p>
          <p className="text-gray-400 text-xs mt-2">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleString()}` : "No updates yet"}
          </p>
        </div>
      </div>

      {/* Editable Description */}
      <div className="mb-8 bg-gray-50 rounded-xl p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-700">About Company</h3>
          <button
            onClick={() => setEditingDesc((prev) => !prev)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {editingDesc ? "Cancel" : "Edit"}
          </button>
        </div>

        {editingDesc ? (
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write something about your company..."
            className="h-40"
          />
        ) : description ? (
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</p>
        ) : (
          <p className="text-gray-400 italic">No description yet.</p>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Company Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company name" />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Address</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Company address" />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Website</label>
          <Input value={web} onChange={(e) => setWeb(e.target.value)} placeholder="https://yourcompany.com" />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Category</label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Tech, Retail" />
        </div>
      </div>

      <div className="pt-8">
        <Button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-3 rounded-lg text-white font-semibold transition 
            ${saving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

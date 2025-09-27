"use client";

import { useState, useEffect, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";

export default function CompanyInfoTab({ companyId }: { companyId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updated, setUpdated] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [photoURL, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Загружаем данные компании
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
            setWebsite(data.website || "");
            setCategory(data.category || "");
            setDescription(data.description || "");
            setPhotoUrl(data.photoUrl || null);

            setUpdated(true);
            setTimeout(() => setUpdated(false), 2000);
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

  // Конвертируем файл в Base64
  const fileToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

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
        website,
        category,
        description,
        photoURL: finalBase64, // сохраняем Base64
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(error);
      alert("Failed to save company info.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (file: File) => {
    setPhotoFile(file);
    // Для preview можно сразу конвертировать в Base64
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
    <div className="w-full ">
      {updated && (
        <div className="absolute top-2 right-4 bg-green-500 text-white text-sm px-3 py-1 rounded-lg shadow-md animate-fade-in-out">
          Updated successfully ✅
        </div>
      )}

      <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-xl flex flex-col lg:flex-row gap-6 p-6 lg:p-8">
        {/* Фото компании */}
        <div
          className="w-full lg:w-48 h-48 border border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden relative cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {photoURL ? (
            <>
              <img src={photoURL} alt="Company" className="w-full h-full object-cover rounded-xl" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto();
                }}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow"
              >
                ×
              </button>
            </>
          ) : (
            <span className="text-gray-400 text-center text-sm px-2">Click to Upload</span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
          />
        </div>

        {/* Форма */}
        <div className="flex-1 space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Company Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company Name" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Address</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your company..." className="h-32" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Website</label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Category</label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
          </div>

          <Button
            onClick={handleSave}
            className={`bg-blue-600 text-white w-full ${saving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"}`}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in-out {
          animation: fadeInOut 2s ease-in-out;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-5px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}

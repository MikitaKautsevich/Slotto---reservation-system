"use client";

import { useState, useEffect, useRef } from "react";
import { db, auth, storage } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged, User } from "firebase/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";

export default function CompanyInfoTab() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
          const data = companyDoc.data();
          setCompanyId(companyDoc.id);
          setName(data.name || "");
          setWebsite(data.website || "");
          setCategory(data.category || "");
          setDescription(data.description || "");
          setPhotoURL(data.photoURL || null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const uploadPhoto = (file: File, companyId: string) => {
    return new Promise<string>((resolve, reject) => {
      const storageRef = ref(storage, `company_photos/${companyId}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleSave = async () => {
    if (!user || !companyId) return;
    setSaving(true);

    try {
      let uploadedPhotoURL = photoURL;
      if (photoFile) {
        uploadedPhotoURL = await uploadPhoto(photoFile, companyId);
        setPhotoURL(uploadedPhotoURL);
      }

      await updateDoc(doc(db, "companies", companyId), {
        name,
        website,
        category,
        description,
        photoURL: uploadedPhotoURL,
        updatedAt: new Date(),
      });

      alert("Company info updated ✅");
    } catch (error) {
      console.error(error);
      alert("Failed to save company info.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (file: File) => {
    setPhotoFile(file);
    setPhotoURL(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoURL(null);
  };

  if (loading) return <p className="text-gray-500 text-center mt-10">Loading company info...</p>;
  if (!user) return <p className="text-red-500 text-center mt-10">Please log in to view company info.</p>;

  return (
    <div className="w-full p-4 sm:p-6">
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-xl flex flex-col lg:flex-row gap-6 p-6 lg:p-8">
        <div
          className="w-full lg:w-48 h-48 border border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden relative cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
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
            <span className="text-gray-400 text-center text-sm px-2">Drag & Drop or Click to Upload</span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
          />
        </div>

        <div className="flex-1 space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Company Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company Name" />
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
    </div>
  );
}

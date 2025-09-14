"use client";

import { FC, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, Timestamp, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const RegisterCompany: FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [web, setWeb] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("barbershop");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = "Company name is required";
    if (!web.trim()) newErrors.web = "Website or social link is required";
    if (!address.trim()) newErrors.address = "Company address is required";
    return newErrors;
  };

  const handleRegister = async () => {
    if (!user) {
      setInfo("You must be logged in to register a company");
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const newCompanyRef = await addDoc(collection(db, "companies"), {
        name,
        web,
        address,
        category,
        ownerId: user.uid,
        createdAt: Timestamp.now(),
      });

      await updateDoc(doc(db, "users", user.uid), {
        role: "companyAdmin",
        companyId: newCompanyRef.id,
      });

      setInfo("✅ Company successfully registered!");
      setTimeout(() => router.push("/company/dashboard"), 1500);
    } catch (err) {
      console.error(err);
      setInfo("❌ Failed to create company. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg text-center">
        <h2 className="text-3xl font-bold text-gray-800">Register Your Company</h2>
        <p className="mt-2 text-gray-600">
          Please log in to your account to register your company.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800">
        Company Registration
      </h2>

      {info && <p className="text-center text-blue-600 font-semibold">{info}</p>}

      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Company Name</label>
        <Input
          placeholder="BarberShop One"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={errors.name ? "border-red-500 focus:ring-red-500" : ""}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium mb-1">Website / Social Link</label>
        <Input
          placeholder="https://instagram.com/barbershopone"
          value={web}
          onChange={(e) => setWeb(e.target.value)}
          className={errors.web ? "border-red-500 focus:ring-red-500" : ""}
        />
        {errors.web && <p className="text-red-500 text-xs mt-1">{errors.web}</p>}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <Input
          placeholder="123 Main St, New York"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={errors.address ? "border-red-500 focus:ring-red-500" : ""}
        />
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border p-3 rounded-lg focus:ring focus:ring-blue-300"
        >
          <option value="barbershop">Barbershop</option>
          <option value="coffee">Coffee Shop</option>
          <option value="restaurant">Restaurant</option>
          <option value="fitness">Fitness Club</option>
          <option value="beauty">Beauty Salon</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Submit */}
      <Button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg shadow-md transition-all"
      >
        {loading ? "Registering..." : "Register Company"}
      </Button>
    </div>
  );
};

export default RegisterCompany;

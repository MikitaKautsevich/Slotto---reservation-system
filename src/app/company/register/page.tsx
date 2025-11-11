"use client";

import { FC, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, Timestamp, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Input from "@/components/custom/Input";
import Button from "@/components/custom/Button";
import Card from "@/components/custom/Card";
import Select from "@/components/custom/Select";

const RegisterCompany: FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    web: "",
    address: "",
    category: "barbershop",
  });
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = "Company name is required";
    if (!form.web.trim()) newErrors.web = "Website or social link is required";
    if (!form.address.trim()) newErrors.address = "Company address is required";
    return newErrors;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setInfo("⚠️ Please log in to register your company.");
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
        ...form,
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <Card className="w-full max-w-md p-8 bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl border border-gray-100 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Register Your Company</h2>
          <p className="text-gray-500">Please log in to your account to continue.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 min-h-screen justify-center pb-20">
      <Card className="w-full max-w-md p-8 bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl border border-gray-100 relative z-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Company Registration 🏢
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Create your company profile to access your business dashboard.
        </p>

        {info && (
          <p className="text-center text-indigo-600 font-semibold mb-4">{info}</p>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            name="name"
            placeholder="Company Name"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? "border-red-500 focus:ring-red-500" : ""}
            required
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

          <Input
            name="web"
            placeholder="Website / Instagram"
            value={form.web}
            onChange={handleChange}
            className={errors.web ? "border-red-500 focus:ring-red-500" : ""}
            required
          />
          {errors.web && <p className="text-red-500 text-xs">{errors.web}</p>}

          <Input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className={errors.address ? "border-red-500 focus:ring-red-500" : ""}
            required
          />
          {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}

          <Select
            name="category"
            value={form.category}
            onChange={handleChange}
            options={[
              "barbershop",
              "coffee",
              "restaurant",
              "fitness",
              "beauty",
              "other",
            ]}
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold py-2.5 rounded-xl hover:shadow-lg hover:scale-[1.01] transition-transform"
          >
            {loading ? "Registering..." : "Register Company"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default RegisterCompany;

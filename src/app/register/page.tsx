"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

enum RegisterRole {
  User = "user",
  Company = "company",
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    role: RegisterRole.User,
    email: "",
    password: "",
    phone: "",
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await updateProfile(userCred.user, {
        displayName: form.fullName,
      });

      await setDoc(doc(db, "users", userCred.user.uid), {
        fullName: form.fullName,
        role: form.role,
        email: form.email,
        phone: form.phone,
        createdAt: new Date(),
      });

      await sendEmailVerification(userCred.user);

      setStep(2); // Переход на шаг подтверждения
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCheckVerification = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setStep(3); // Переход на успех
      } else {
        setError("Your email is not verified yet. Please check your inbox.");
      }
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      {/* Progress bar */}
      <div className="flex justify-between items-center mb-6">
        {["Details", "Verify Email", "Success"].map((label, index) => {
          const currentStep = index + 1;
          const isActive = currentStep === step;
          const isCompleted = currentStep < step;

          return (
            <div key={label} className="flex-1 flex flex-col items-center">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-bold transition ${
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isActive
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? "✓" : currentStep}
              </div>
              <span
                className={`mt-2 text-sm ${
                  isActive || isCompleted ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

      {/* Step 1: ввод данных */}
      {step === 1 && (
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value={RegisterRole.User}>User</option>
            <option value={RegisterRole.Company}>Company</option>
          </select>

          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
      )}

      {/* Step 2: подтверждение почты */}
      {step === 2 && (
        <div className="space-y-4 text-center">
          <p className="text-gray-700">
            We sent you a verification email. Please check your inbox and click
            the link to confirm your email.
          </p>
          <Button
            onClick={handleCheckVerification}
            className="w-full bg-blue-600 text-white"
          >
            I confirmed my email
          </Button>
        </div>
      )}

      {/* Step 3: успех */}
      {step === 3 && (
        <div className="text-center space-y-4">
          <p className="text-green-600 font-semibold text-lg">
            🎉 Your account has been successfully created!
          </p>
          <a
            href="/login"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Go to Login
          </a>
        </div>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </Card>
  );
}

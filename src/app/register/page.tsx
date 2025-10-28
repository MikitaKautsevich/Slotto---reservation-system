"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Link from "next/link";
import Select from "@/components/ui/Select";

enum RegisterRole {
  User = "user",
  Company = "company",
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    role: RegisterRole.User,
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
      setEmailSent(true);
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Автопереход после подтверждения почты
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          router.push("/dashboard");
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden pb-20 min-h-screen justify-center">
        {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div> */}
      <Card className="w-full max-w-md p-8 bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl border border-gray-100 relative z-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Get Started 🚀</h2>
        <p className="text-gray-500 text-center mb-8">
          Let’s create your new account to start your journey!
        </p>
        {!emailSent ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
            />

            <Select
              name="role"
              value={form.role}
              onChange={handleChange}
              options={[RegisterRole.User, RegisterRole.Company]}
              className="w-full"
            />



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

            <Button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold py-2.5 rounded-xl hover:shadow-lg hover:scale-[1.01] transition-transform"
              disabled={loading}
            >
              {loading ? "Creating..." : "Register"}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              ✅ Registration successful! Please check your email to confirm your account.
            </p>
            <p className="text-sm text-gray-500">
              Once confirmed, you’ll be redirected to your dashboard automatically.
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-600 mt-4 text-center font-medium">{error}</p>
        )}

        <p className="text-sm text-gray-600 text-center mt-6">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-indigo-600 hover:underline font-semibold"
          >
            Login
          </a>
        </p>
      </Card>
    </div>
  );
}

function getFriendlyErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "Этот email уже зарегистрирован. Попробуйте войти или использовать другой адрес.";
    case "auth/invalid-email":
      return "Некорректный формат email.";
    case "auth/weak-password":
      return "Пароль слишком простой. Используйте минимум 6 символов.";
    case "auth/missing-password":
      return "Введите пароль.";
    case "auth/network-request-failed":
      return "Ошибка сети. Проверьте подключение к интернету.";
    case "auth/too-many-requests":
      return "Слишком много попыток. Попробуйте позже.";
    default:
      return "Произошла ошибка при регистрации. Попробуйте снова.";
  }
}

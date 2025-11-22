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
import Button from "@/components/custom/Button";
import Input from "@/components/custom/Input";
import Card from "@/components/custom/Card";
import Link from "next/link";
import Select from "@/components/custom/Select";

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
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden px-6 bg-black/5">

      {/* Neon background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-purple-600/20 rounded-full blur-[130px]" />
      </div>

      <Card className="w-full max-w-md p-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl relative z-10">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Create Account 🚀
        </h2>
        <p className="text-center text-white/60 mt-2 mb-8">
          Fill in the details to start your journey
        </p>

        {!emailSent ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <Input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
              className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-purple-500"
            />

            <Select
              name="role"
              value={form.role}
              onChange={handleChange}
              options={[RegisterRole.User, RegisterRole.Company]}
              className="w-full bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-purple-500"
            />

            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-purple-500"
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-purple-500"
            />
            <Input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
              className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-purple-500"
            />

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 rounded-xl
                bg-gradient-to-r from-blue-600 to-purple-600 
                text-white font-semibold
                hover:opacity-90 hover:scale-[1.02]
                transition
              "
            >
              {loading ? "Creating..." : "Register"}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-white/80">
              ✅ Registration successful! Check your email to confirm your account.
            </p>
            <p className="text-sm text-white/50">
              After confirmation, you’ll be redirected to your dashboard automatically.
            </p>
          </div>
        )}

        <p className="text-center text-white/60 text-sm mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            Login
          </Link>
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

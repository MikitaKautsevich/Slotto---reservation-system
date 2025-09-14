"use client";

import { useState } from "react";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // result.user содержит информацию о пользователе
      alert(`Welcome ${result.user.displayName}`);
      window.location.href = "/";
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
        <Button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white"
          disabled={loading}
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
          >
            <path fill="#ffffff" d="M24 9.5c3.94 0 7.03 1.64 9.17 3.02l6.84-6.84C35.63 2.47 30.18 0 24 0 14.62 0 6.51 5.44 2.69 13.31l7.98 6.19C12.13 13.41 17.6 9.5 24 9.5z"/>
            <path fill="#34A853" d="M46.5 24.5c0-1.5-.14-2.94-.39-4.34H24v8.2h12.7c-.55 2.9-2.16 5.36-4.61 7.02l7.19 5.59c4.19-3.88 6.62-9.61 6.62-16.47z"/>
            <path fill="#4A90E2" d="M24 48c6.48 0 11.9-2.13 15.86-5.79l-7.19-5.59c-2.06 1.39-4.71 2.23-7.67 2.23-5.9 0-10.88-3.98-12.67-9.34H2.69l-7.98 6.19C6.51 42.56 14.62 48 24 48z"/>
            <path fill="#FBBC05" d="M11.33 29.51A14.49 14.49 0 0 1 10 24c0-1.89.34-3.7.92-5.39l-7.98-6.19C1.21 15.37 0 19.52 0 24c0 4.48 1.21 8.63 3.31 12.58l8.02-7.07z"/>
          </svg>
          Sign in with Google
        </Button>
      </form>
      <p className="text-sm text-gray-600 mt-4">
        Don’t have an account?{" "}
        <a href="/register" className="text-blue-600 hover:underline">Register</a>
      </p>
    </Card>
  );
}

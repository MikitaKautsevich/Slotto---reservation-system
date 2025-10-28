"use client";

import { useState } from "react";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

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
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError("Invalid email or password");
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
      alert(`Welcome ${result.user.displayName}`);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden pb-20 min-h-screen justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <Card className="w-full max-w-md p-8 bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl border border-gray-100 relative z-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Welcome back 👋
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Sign in to your account to continue
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="focus:ring-2 focus:ring-indigo-500"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="focus:ring-2 focus:ring-indigo-500"
          />

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold py-2.5 rounded-xl hover:shadow-lg hover:scale-[1.01] transition-transform"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white/80 px-3 text-gray-500">or</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 py-2.5 rounded-xl shadow-sm transition"
            disabled={loading}
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span className="text-gray-700 font-medium">Sign in with Google</span>
          </Button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-6">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-indigo-600 hover:underline font-semibold"
          >
            Register
          </a>
        </p>
      </Card>
    </div>
  );
}

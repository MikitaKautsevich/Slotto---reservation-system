"use client";

import { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

import Button from "@/components/custom/Button";
import Input from "@/components/custom/Input";
import Card from "@/components/custom/Card";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Email + Password Login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/dashboard";
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      window.location.href = "/dashboard";
    } catch {
      setError("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden px-6">

      {/* Soft neon background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-purple-600/20 rounded-full blur-[130px]" />
      </div>

      {/* Main card */}
      <Card className="w-full max-w-md p-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl relative z-10">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Welcome back 👋
        </h2>

        <p className="text-center text-white/60 mt-2 mb-8">
          Sign in to your account to continue
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            required
            className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-purple-500"
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
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
            {loading ? "Signing in..." : "Login"}
          </Button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-4 text-white/40 text-sm">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="
              w-full py-3 rounded-xl
              flex items-center justify-center gap-3
              bg-white/10 border border-white/20
              hover:bg-white/15 transition
            "
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span className="text-white font-medium">Sign in with Google</span>
          </Button>
        </form>

        <p className="text-center text-white/60 text-sm mt-6">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}

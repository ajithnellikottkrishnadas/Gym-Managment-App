"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Email/Password login
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const token = await cred.user.getIdToken();
      document.cookie = `authToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  // Google login
  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const token = await result.user.getIdToken();
      document.cookie = `authToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Google sign-in failed");
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left side - Branding / Image */}
      <div className="hidden md:flex bg-gradient-to-br from-red-600 to-red-800 text-white items-center justify-center p-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">🏋️‍♂️ Gym Manager</h1>
          <p className="text-lg opacity-90">Manage members, payments & reports with ease.</p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex items-center justify-center bg-gray-50 p-6">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Trainer Login</h2>
            <p className="text-sm text-gray-500">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
              {error}
            </div>
          )}

          {/* Email login */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              placeholder="trainer@gym.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-lg"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 hover:bg-red-700 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-gray-400 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google sign-in button */}
          <Button
            type="button"
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
            Sign in with Google
          </Button>

          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Gym Manager. All rights reserved.
          </div>
        </form>
      </div>
    </div>
  );
}

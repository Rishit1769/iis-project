"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login");
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white items-center justify-center relative overflow-hidden">
        <div className="texture-vertical-lines absolute inset-0" />
        <div className="relative z-10 p-16">
          <h1 className="font-display text-7xl font-bold tracking-tight leading-none mb-8">
            Begin
            <br />
            <span className="italic">Your</span>
            <br />
            Journey
          </h1>
          <div className="rule-thick w-16 bg-white my-8" />
          <p className="font-body text-lg text-white/60 max-w-sm">
            Create your account and start conducting AI-powered viva
            examinations.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 md:px-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12">
            <h1 className="font-display text-4xl font-bold tracking-tight">
              AI Viva Examiner
            </h1>
          </div>

          <p className="font-mono text-xs uppercase tracking-widest mb-4">
            Create Account
          </p>
          <div className="rule-thick w-12 mb-8" />

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="Dr. Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="teacher@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className="border-2 border-black p-4">
                <p className="font-mono text-xs uppercase tracking-wider">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8">
            <div className="rule-thin mb-8" />
            <p className="font-body text-sm text-[#525252]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-black font-medium underline underline-offset-4 hover:no-underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

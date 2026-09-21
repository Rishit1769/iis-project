"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white items-center justify-center relative overflow-hidden">
        <div className="texture-vertical-lines absolute inset-0" />
        <div className="relative z-10 p-16">
          <h1 className="font-display text-7xl font-bold tracking-tight leading-none mb-8">
            AI
            <br />
            <span className="italic">Viva</span>
            <br />
            Examiner
          </h1>
          <div className="rule-thick w-16 bg-white my-8" />
          <p className="font-body text-lg text-white/60 max-w-sm">
            Adaptive laboratory viva examination powered by artificial
            intelligence.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 md:px-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12">
            <h1 className="font-display text-4xl font-bold tracking-tight">
              AI Viva Examiner
            </h1>
          </div>

          <p className="font-mono text-xs uppercase tracking-widest mb-4">
            Sign In
          </p>
          <div className="rule-thick w-12 mb-8" />

          <form onSubmit={handleSubmit} className="space-y-8">
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8">
            <div className="rule-thin mb-8" />
            <p className="font-body text-sm text-[#525252]">
              <Link
                href="/register"
                className="text-black font-medium underline underline-offset-4 hover:no-underline"
              >
                Create an account
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <Link
              href="/viva"
              className="font-mono text-xs uppercase tracking-widest text-[#525252] hover:text-black hover:underline underline-offset-4 transition-colors duration-100"
            >
              Student? Join a viva session →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

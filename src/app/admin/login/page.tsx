"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, Eye, EyeOff, Coffee } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail("manager@nowave.cafe");
    setPassword("NoWave2024!");
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brass/10 mb-4">
            <Coffee className="w-8 h-8 text-brass" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-espresso">
            NoWave Admin
          </h1>
          <p className="text-espresso/50 font-sans text-sm mt-1">
            Restaurant Manager Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-espresso/5 border border-brass/10 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm font-medium border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-espresso/70 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50
                           focus:outline-none focus:ring-2 focus:ring-brass/30 focus:border-brass
                           text-espresso font-sans transition-all"
                placeholder="manager@nowave.cafe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50/50
                             focus:outline-none focus:ring-2 focus:ring-brass/30 focus:border-brass
                             text-espresso font-sans transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso/40 hover:text-espresso/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brass hover:bg-brass-dark text-white font-semibold py-3 px-4
                         rounded-xl transition-all duration-200 flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brass/20
                         hover:shadow-xl hover:shadow-brass/30"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-espresso/40 mb-3 uppercase tracking-wider font-semibold">
              Demo Credentials
            </p>
            <button
              onClick={handleDemoLogin}
              className="w-full bg-espresso/5 hover:bg-espresso/10 text-espresso/70
                         font-medium py-3 px-4 rounded-xl transition-all duration-200
                         text-sm border border-espresso/5"
            >
              <span className="block text-xs text-espresso/40 mb-1">Click to auto-fill</span>
              <span className="font-mono text-xs">
                manager@nowave.cafe / NoWave2024!
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

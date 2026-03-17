"use client";

import { useState } from "react";
import { Link, useRouter } from "@/navigation";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/5 via-background to-background">
      <div className="w-full max-w-md p-8 space-y-8 glass rounded-2xl border border-border/50 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Create an Account</h1>
          <p className="text-sm text-gray-500">Join the exclusive world of premium real estate</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs font-bold text-red-500 bg-red-50 rounded-xl border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all border-border/50"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="johndoe88"
                className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all border-border/50"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all border-border/50"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all border-border/50"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2 pb-4">
            <label className="text-sm font-medium">Join as</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'CUSTOMER' })}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${formData.role === 'CUSTOMER' ? 'bg-accent text-accent-foreground border-accent' : 'bg-transparent text-gray-500 border-border hover:bg-accent/5'}`}
              >
                Bidder
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'OWNER' })}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${formData.role === 'OWNER' ? 'bg-accent text-accent-foreground border-accent' : 'bg-transparent text-gray-500 border-border hover:bg-accent/5'}`}
              >
                Owner
              </button>
            </div>
          </div>

          <Button type="submit" variant="accent" className="w-full h-12 text-lg" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-500">Already have an account? </span>
          <Link href="/login" className="text-accent font-medium hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

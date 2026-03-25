"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
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
        setError("Invalid credentials");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-text-primary tracking-wide">
            Admin Portal
          </h1>
          <p className="mt-2 text-xs text-text-muted">
            Andreas Boutsikas Photography
          </p>
        </div>

        <div className="bg-bg-card border border-border rounded-sm p-8 shadow-subtle">
          <h2 className="font-serif text-2xl text-text-primary mb-6">
            Sign in
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50/50 border border-red-200/50 rounded-sm">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="email"
              className="h-12"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="h-12"
            />

            <Button type="submit" className="w-full h-12 mt-6" loading={loading}>
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center mt-6">
          <Link href="/auth/login" className="text-sm text-text-muted hover:text-accent transition-colors">
            Back to Client Portal
          </Link>
        </p>
      </div>
    </div>
  );
}

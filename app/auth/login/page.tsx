"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ClientLoginPage() {
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
        setError("The email or password you entered is incorrect.");
        setLoading(false);
        return;
      }

      router.push("/client/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B7355' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <div className="mb-16">
            <div className="relative w-20 h-20 mb-8">
              <Image src="/logo.png" alt="AB" fill className="object-contain" />
            </div>
            <h1 className="font-serif text-4xl xl:text-5xl text-text-primary tracking-wide leading-tight">
              Andreas<br />Boutsikas
            </h1>
            <p className="mt-6 text-accent text-sm tracking-widest uppercase">
              Photography
            </p>
          </div>

          <blockquote className="max-w-md">
            <p className="font-serif text-2xl text-text-secondary italic leading-relaxed">
              &ldquo;Every photograph is a story waiting to be told.&rdquo;
            </p>
          </blockquote>

          <div className="mt-auto pt-12">
            <p className="text-xs text-text-muted">Private Client Portal</p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <h1 className="font-serif text-3xl text-text-primary tracking-wide">
              Andreas Boutsikas
            </h1>
            <p className="mt-2 text-xs text-accent tracking-widest uppercase">
              Private Client Portal
            </p>
          </div>

          <div className="bg-bg-card border border-border rounded-sm p-8 sm:p-10 shadow-subtle">
            <div className="mb-8">
              <h2 className="font-serif text-2xl text-text-primary mb-2">
                Welcome back
              </h2>
              <p className="text-sm text-text-secondary">
                Sign in to view your galleries.
              </p>
            </div>

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
                placeholder="your@email.com"
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

          <p className="text-center text-sm text-text-muted mt-8">
            Need access?{" "}
            <a href="mailto:contact@andreasboutsikas.com" className="text-accent hover:underline">
              Contact your photographer
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

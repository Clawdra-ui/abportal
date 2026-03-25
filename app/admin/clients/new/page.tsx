"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function NewClientPage() {
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
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create client");
        setLoading(false);
        return;
      }

      router.push("/admin/clients");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8">
        <Link href="/admin/clients" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to clients
        </Link>
        <h1 className="font-serif text-3xl text-text-primary">Add Client</h1>
        <p className="text-text-secondary mt-1">Create a new client account.</p>
      </div>

      <div className="max-w-xl">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>
              )}

              <Input label="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" />
              <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@example.com" required />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required minLength={6} />

              <div className="flex items-center gap-3 pt-4">
                <Button type="submit" loading={loading}>Create Client</Button>
                <Link href="/admin/clients"><Button type="button" variant="ghost">Cancel</Button></Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

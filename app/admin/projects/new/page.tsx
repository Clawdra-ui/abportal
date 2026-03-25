"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface Client { id: string; email: string; name: string | null; }

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [shootDate, setShootDate] = useState("");
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/clients").then((res) => res.json()).then((data) => { if (Array.isArray(data)) setClients(data); });
  }, []);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, "-")) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, description, location, shootDate: shootDate || undefined, clientIds, published }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create project"); setLoading(false); return; }
      router.push(`/admin/projects/${data.id}/edit`); router.refresh();
    } catch { setError("An error occurred. Please try again."); setLoading(false); }
  };

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name ? `${c.name} (${c.email})` : c.email }));

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8">
        <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to projects
        </Link>
        <h1 className="font-serif text-3xl text-text-primary">Create Project</h1>
        <p className="text-text-secondary mt-1">Set up a new photography project and gallery.</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>}
              <Input label="Project Title" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Villa Eden — Santorini" required />
              <Input label="URL Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="villa-eden-santorini" required />
              <Textarea label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the project..." rows={3} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Santorini, Greece" />
                <Input label="Shoot Date (optional)" type="date" value={shootDate} onChange={(e) => setShootDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Assign to Clients</label>
                <select multiple value={clientIds} onChange={(e) => setClientIds(Array.from(e.target.selectedOptions, (opt) => opt.value))} className="w-full h-32 px-3 py-2 rounded-sm border border-border bg-white text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent">
                  {clientOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <p className="mt-1 text-xs text-text-muted">Hold Ctrl/Cmd to select multiple clients</p>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="published" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4 rounded-sm border-border text-accent focus:ring-accent" />
                <label htmlFor="published" className="text-sm text-text-primary cursor-pointer">Publish project (make visible to clients)</label>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Button type="submit" loading={loading}>Create Project</Button>
                <Link href="/admin/projects"><Button type="button" variant="ghost">Cancel</Button></Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

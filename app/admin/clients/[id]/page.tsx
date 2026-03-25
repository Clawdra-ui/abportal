"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trash2 } from "lucide-react";
import { formatShortDate } from "@/lib/utils";

interface Client {
  id: string; name: string | null; email: string; createdAt: string;
  projects: { id: string; project: { id: string; title: string; slug: string } }[];
}

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/clients/${clientId}`)
      .then((res) => res.json())
      .then((data) => { setClient(data); setName(data.name || ""); setEmail(data.email); setLoading(false); })
      .catch(() => { setError("Failed to load client"); setLoading(false); });
  }, [clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: newPassword || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to update client"); setSaving(false); return; }
      setNewPassword(""); setSaving(false); router.refresh();
    } catch { setError("An error occurred. Please try again."); setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
      if (!res.ok) { const data = await res.json(); setError(data.error || "Failed to delete client"); setDeleting(false); return; }
      router.push("/admin/clients"); router.refresh();
    } catch { setError("An error occurred. Please try again."); setDeleting(false); }
  };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-bg-secondary rounded" /><div className="h-64 bg-bg-secondary rounded" /></div></div>;
  if (!client) return <div className="p-8"><p className="text-text-muted">Client not found.</p></div>;

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8">
        <Link href="/admin/clients" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to clients
        </Link>
        <h1 className="font-serif text-3xl text-text-primary">Edit Client</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>}
                <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" />
                <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <div className="border-t border-border pt-5">
                  <p className="text-sm text-text-secondary mb-3">Leave password blank to keep current password.</p>
                  <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password to reset" minLength={6} />
                </div>
                <div className="flex items-center gap-3 pt-4"><Button type="submit" loading={saving}>Save Changes</Button></div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-medium text-text-primary mb-4">Client Information</h3>
              <dl className="space-y-3 text-sm">
                <div><dt className="text-text-muted">Email</dt><dd className="text-text-primary">{client.email}</dd></div>
                <div><dt className="text-text-muted">Created</dt><dd className="text-text-primary">{formatShortDate(client.createdAt)}</dd></div>
                <div><dt className="text-text-muted">Projects</dt><dd className="text-text-primary">{client.projects.length}</dd></div>
              </dl>
            </CardContent>
          </Card>

          {client.projects.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-medium text-text-primary mb-4">Assigned Projects</h3>
                <div className="space-y-2">
                  {client.projects.map((p) => (
                    <Link key={p.id} href={`/admin/projects/${p.project.id}/edit`} className="block text-sm text-accent hover:underline">{p.project.title}</Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-red-200">
            <CardContent className="p-6">
              <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
              <p className="text-sm text-text-secondary mb-4">Deleting a client will remove their access to all projects.</p>
              <Button variant="secondary" className="w-full border-red-300 text-red-600 hover:bg-red-50" onClick={handleDelete} loading={deleting}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete Client
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Upload, Trash2 } from "lucide-react";
import { formatShortDate } from "@/lib/utils";

interface Client { id: string; email: string; name: string | null; }
interface Image { id: string; filename: string; order: number; }
interface Project { id: string; title: string; slug: string; description: string | null; location: string | null; shootDate: string | null; coverImage: string | null; zipFile: string | null; published: boolean; createdAt: string; images: Image[]; access: { userId: string; user: Client }[]; }

function EditProjectContent() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [shootDate, setShootDate] = useState("");
  const [published, setPublished] = useState(false);
  const [assignedClientIds, setAssignedClientIds] = useState<string[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingZip, setUploadingZip] = useState(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${projectId}`).then((res) => res.json()),
      fetch("/api/clients").then((res) => res.json()),
    ]).then(([projectData, clientsData]) => {
      if (projectData.error) { setError(projectData.error); return; }
      setProject(projectData);
      setTitle(projectData.title); setSlug(projectData.slug); setDescription(projectData.description || "");
      setLocation(projectData.location || ""); setShootDate(projectData.shootDate?.split("T")[0] || "");
      setPublished(projectData.published); setAssignedClientIds(projectData.access.map((a: { userId: string }) => a.userId));
      if (Array.isArray(clientsData)) setAllClients(clientsData);
      setLoading(false);
    }).catch(() => { setError("Failed to load project"); setLoading(false); });
  }, [projectId]);

  const handleSave = async () => {
    setError(""); setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, description, location, shootDate: shootDate || undefined, published, clientIds: assignedClientIds }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save project"); setSaving(false); return; }
      toast("Project saved successfully", "success"); setSaving(false);
    } catch { setError("An error occurred. Please try again."); setSaving(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files || files.length === 0) return;
    setUploadingImages(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("images", files[i]);
    try {
      const res = await fetch(`/api/projects/${projectId}/images`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { toast(data.error || "Failed to upload images", "error"); setUploadingImages(false); return; }
      const updatedProject = await fetch(`/api/projects/${projectId}`).then((res) => res.json());
      setProject(updatedProject); toast(`${files.length} image(s) uploaded`, "success");
    } catch { toast("Failed to upload images", "error"); }
    setUploadingImages(false); e.target.value = "";
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingZip(true);
    const formData = new FormData(); formData.append("zip", file);
    try {
      const res = await fetch(`/api/projects/${projectId}/zip`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { toast(data.error || "Failed to upload ZIP", "error"); setUploadingZip(false); return; }
      const updatedProject = await fetch(`/api/projects/${projectId}`).then((res) => res.json());
      setProject(updatedProject); toast("ZIP file uploaded successfully", "success");
    } catch { toast("Failed to upload ZIP", "error"); }
    setUploadingZip(false); e.target.files = null;
  };

  const handleDeleteImage = async (imageId: string) => {
    setDeletingImage(imageId);
    try {
      const res = await fetch(`/api/upload/image/${imageId}`, { method: "DELETE" });
      if (!res.ok) { const data = await res.json(); toast(data.error || "Failed to delete image", "error"); return; }
      const updatedProject = await fetch(`/api/projects/${projectId}`).then((res) => res.json());
      setProject(updatedProject); toast("Image deleted", "success");
    } catch { toast("Failed to delete image", "error"); }
    setDeletingImage(null); setDeleteModalOpen(false);
  };

  const handleDeleteProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (!res.ok) { const data = await res.json(); setError(data.error || "Failed to delete project"); return; }
      router.push("/admin/projects"); router.refresh();
    } catch { setError("Failed to delete project"); }
  };

  const clientOptions = allClients.map((c) => ({ value: c.id, label: c.name ? `${c.name} (${c.email})` : c.email }));

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-bg-secondary rounded" /><div className="h-96 bg-bg-secondary rounded" /></div></div>;
  if (!project) return <div className="p-8"><p className="text-text-muted">Project not found.</p></div>;

  return (
    <div className="p-8 lg:p-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to projects
          </Link>
          <h1 className="font-serif text-3xl text-text-primary">Edit Project</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={published ? "success" : "warning"}>{published ? "Published" : "Draft"}</Badge>
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </div>

      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4"><h2 className="font-serif text-xl text-text-primary">Project Details</h2></CardHeader>
            <CardContent className="space-y-5">
              <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Villa Eden — Santorini" required />
              <Input label="URL Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="villa-eden-santorini" required />
              <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." rows={3} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Santorini, Greece" />
                <Input label="Shoot Date" type="date" value={shootDate} onChange={(e) => setShootDate(e.target.value)} />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="published" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4 rounded-sm border-border text-accent focus:ring-accent" />
                <label htmlFor="published" className="text-sm text-text-primary cursor-pointer">Published (visible to clients)</label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <h2 className="font-serif text-xl text-text-primary">Gallery Images</h2>
              <p className="text-sm text-text-secondary mt-1">Upload images to display in the client gallery.</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />{uploadingImages ? "Uploading..." : "Upload Images"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageUpload} className="hidden" disabled={uploadingImages} />
                </label>
              </div>
              {project.images.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-sm"><p className="text-text-muted">No images uploaded yet.</p></div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {project.images.map((image) => (
                    <div key={image.id} className="relative aspect-square bg-bg-secondary rounded-sm overflow-hidden group">
                      <Image src={image.filename.startsWith("/") ? image.filename : `/images/${image.filename}`} alt="Gallery image" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button onClick={() => { setDeletingImage(image.id); setDeleteModalOpen(true); }} className="p-2 bg-white/90 rounded-sm text-red-600 hover:bg-white"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <h2 className="font-serif text-xl text-text-primary">Downloadable ZIP</h2>
              <p className="text-sm text-text-secondary mt-1">Upload a ZIP file for clients to download all photos.</p>
            </CardHeader>
            <CardContent>
              {project.zipFile ? (
                <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-bg-card rounded-sm"><svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="M9 15l3 3 3-3" /></svg></div>
                    <div><p className="font-medium text-text-primary">{project.slug}.zip</p><p className="text-sm text-text-secondary">Ready for download</p></div>
                  </div>
                  <label className="btn-secondary cursor-pointer">Replace ZIP<input type="file" accept=".zip" onChange={handleZipUpload} className="hidden" disabled={uploadingZip} /></label>
                </div>
              ) : (
                <label className="block border border-dashed border-border rounded-sm p-8 text-center cursor-pointer hover:border-accent transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-3 text-text-muted" />
                  <p className="text-text-primary mb-1">{uploadingZip ? "Uploading..." : "Upload ZIP File"}</p>
                  <p className="text-sm text-text-muted">Drag and drop or click to select</p>
                  <input type="file" accept=".zip" onChange={handleZipUpload} className="hidden" disabled={uploadingZip} />
                </label>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4"><h2 className="font-serif text-xl text-text-primary">Client Access</h2></CardHeader>
            <CardContent>
              <select multiple value={assignedClientIds} onChange={(e) => setAssignedClientIds(Array.from(e.target.selectedOptions, (opt) => opt.value))} className="w-full h-40 px-3 py-2 rounded-sm border border-border bg-white text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent">
                {clientOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <p className="mt-2 text-xs text-text-muted">Select clients who can access this project</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4"><h2 className="font-serif text-xl text-text-primary">Project Info</h2></CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div><dt className="text-text-muted">Project ID</dt><dd className="text-text-primary font-mono text-xs">{project.id}</dd></div>
                <div><dt className="text-text-muted">Created</dt><dd className="text-text-primary">{formatShortDate(project.createdAt)}</dd></div>
                <div><dt className="text-text-muted">Images</dt><dd className="text-text-primary">{project.images.length}</dd></div>
                <div><dt className="text-text-muted">View Project</dt><dd><Link href={`/client/project/${project.slug}`} target="_blank" className="text-accent hover:underline">/client/project/{project.slug}</Link></dd></div>
              </dl>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-6">
              <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
              <p className="text-sm text-text-secondary mb-4">Deleting a project is permanent and cannot be undone.</p>
              <Button variant="secondary" className="w-full border-red-300 text-red-600 hover:bg-red-50" onClick={() => { if (confirm("Are you sure you want to delete this project?")) handleDeleteProject(); }}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete Project
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setDeletingImage(null); }} title="Delete Image">
        <p className="text-text-secondary mb-6">Are you sure you want to delete this image? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => { setDeleteModalOpen(false); setDeletingImage(null); }}>Cancel</Button>
          <Button variant="secondary" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => deletingImage && handleDeleteImage(deletingImage)} loading={!!deletingImage}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function EditProjectPage() {
  return <Suspense fallback={<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-bg-secondary rounded" /><div className="h-96 bg-bg-secondary rounded" /></div></div>}><EditProjectContent /></Suspense>;
}

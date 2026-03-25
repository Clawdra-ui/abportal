import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/utils";
import { Plus, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { access: { include: { user: true } }, _count: { select: { images: true } } },
  });

  return (
    <div className="p-8 lg:p-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-text-primary mb-2">Projects</h1>
          <p className="text-text-secondary">Manage photography projects and galleries.</p>
        </div>
        <Link href="/admin/projects/new"><Button className="gap-2"><Plus className="w-4 h-4" /> New Project</Button></Link>
      </div>

      <div className="bg-bg-card border border-border rounded-sm overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-text-muted mb-4">No projects yet.</p>
            <p className="text-sm text-text-muted mb-6">Create your first project to get started.</p>
            <Link href="/admin/projects/new" className="inline-flex"><Button>Create Your First Project</Button></Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/50">
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Clients</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Images</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3.5 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-text-primary">{project.title}</p>
                      <p className="text-sm text-text-muted font-mono">/{project.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {project.access.length === 0 ? <span className="text-sm text-text-muted">None</span> : project.access.map((a) => <Badge key={a.id} variant="default">{a.user.email.split("@")[0]}</Badge>)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{project._count.images}</td>
                    <td className="px-6 py-4"><Badge variant={project.published ? "success" : "warning"}>{project.published ? "Published" : "Draft"}</Badge></td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{formatShortDate(project.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-4">
                        <Link href={`/client/project/${project.slug}`} target="_blank" className="text-text-muted hover:text-text-primary transition-colors" title="View"><ExternalLink className="w-4 h-4" /></Link>
                        <Link href={`/admin/projects/${project.id}/edit`} className="text-sm text-accent hover:underline">Edit</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

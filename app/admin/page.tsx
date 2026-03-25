import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FolderOpen, Image as ImageIcon, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [clientCount, projectCount, imageCount] = await Promise.all([
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.project.count(),
    prisma.image.count(),
  ]);

  const recentProjects = await prisma.project.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { access: { include: { user: true } }, _count: { select: { images: true } } },
  });

  const stats = [
    { label: "Clients", value: clientCount, icon: Users, href: "/admin/clients" },
    { label: "Projects", value: projectCount, icon: FolderOpen, href: "/admin/projects" },
    { label: "Images", value: imageCount, icon: ImageIcon, href: "/admin/projects" },
  ];

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-10">
        <h1 className="font-serif text-3xl text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover className="transition-all hover:-translate-y-0.5 hover:shadow-subtle">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-serif text-text-primary mb-1">{stat.value}</p>
                    <p className="text-sm text-text-secondary">{stat.label}</p>
                  </div>
                  <div className="p-3 bg-bg-secondary rounded-sm">
                    <stat.icon className="w-5 h-5 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="bg-bg-card border border-border rounded-sm">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h2 className="font-serif text-xl text-text-primary">Recent Projects</h2>
          <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-muted mb-4">No projects yet.</p>
            <Link href="/admin/projects/new" className="btn-primary inline-flex">Create your first project</Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentProjects.map((project) => (
              <div key={project.id} className="px-6 py-4 flex items-center justify-between hover:bg-bg-secondary/30 transition-colors">
                <div className="flex-1 min-w-0 mr-6">
                  <p className="font-medium text-text-primary truncate">{project.title}</p>
                  <p className="text-sm text-text-secondary truncate">
                    {project.access.length > 0 ? project.access.map((a) => a.user.email).join(", ") : "No clients assigned"}
                  </p>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <span className="hidden sm:block text-sm text-text-muted">{project._count.images} images</span>
                  <span className={`px-2.5 py-0.5 rounded-sm text-xs font-medium ${project.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {project.published ? "Published" : "Draft"}
                  </span>
                  <Link href={`/admin/projects/${project.id}/edit`} className="text-sm text-accent hover:underline">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

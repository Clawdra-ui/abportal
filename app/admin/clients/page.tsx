import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    include: { projects: { include: { project: true } }, _count: { select: { projects: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 lg:p-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-text-primary mb-2">Clients</h1>
          <p className="text-text-secondary">Manage client accounts and project access.</p>
        </div>
        <Link href="/admin/clients/new"><Button>Add Client</Button></Link>
      </div>

      <div className="bg-bg-card border border-border rounded-sm overflow-hidden">
        {clients.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-text-muted mb-4">No clients yet.</p>
            <p className="text-sm text-text-muted mb-6">Create your first client to get started.</p>
            <Link href="/admin/clients/new" className="inline-flex"><Button>Add Your First Client</Button></Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/50">
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Projects</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3.5 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-text-primary">{client.name || "Unnamed Client"}</p>
                      <p className="text-sm text-text-secondary">{client.email}</p>
                    </td>
                    <td className="px-6 py-4"><Badge variant="default">{client._count.projects} {client._count.projects === 1 ? 'project' : 'projects'}</Badge></td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{formatShortDate(client.createdAt)}</td>
                    <td className="px-6 py-4 text-right"><Link href={`/admin/clients/${client.id}`} className="text-sm text-accent hover:underline">Edit</Link></td>
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

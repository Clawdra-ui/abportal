import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { signOut } from "next-auth/react";

export default async function ClientDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  const projects = await prisma.project.findMany({
    where: {
      published: true,
      access: { some: { userId: session.user.id } },
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { images: true } } },
  });

  const userDisplayName = session.user.name ||
    session.user.email.split("@")[0].split(/[._-]/).map(
      (part: string) => part.charAt(0).toUpperCase() + part.slice(1)
    ).join(" ");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border bg-bg-card">
        <div className="max-w-8xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/client/dashboard" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image src="/logo.png" alt="AB" fill className="object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="font-serif text-lg tracking-wide text-text-primary leading-none">Andreas Boutsikas</p>
              <p className="text-[10px] text-text-muted tracking-widest uppercase mt-0.5">Photography</p>
            </div>
          </Link>
          <div className="flex items-center gap-8">
            <span className="text-sm text-text-secondary hidden md:block">{userDisplayName}</span>
            <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className="text-sm text-text-muted hover:text-text-primary transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-8xl mx-auto px-6 py-16 md:py-24">
        <div className="mb-16 md:mb-20 animate-in">
          <p className="text-accent text-xs tracking-[0.2em] uppercase mb-4">{today}</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-text-primary mb-6 leading-[1.1]">Your Galleries</h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-xl leading-relaxed">
            Your photography collections, carefully curated and ready for you.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center animate-in">
            <div className="w-24 h-24 mb-10 text-border">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" className="w-full h-full">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <h2 className="font-serif text-3xl text-text-primary mb-4">No galleries yet</h2>
            <p className="text-text-secondary max-w-sm text-center leading-relaxed">
              Your photography collections will appear here once they have been delivered to you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
            {projects.map((project, index) => (
              <Link key={project.id} href={`/client/project/${project.slug}`} className="group animate-in" style={{ animationDelay: `${(index + 1) * 80}ms` }}>
                <article>
                  <div className="relative aspect-[4/3] mb-6 overflow-hidden rounded-sm bg-bg-secondary">
                    {project.coverImage ? (
                      <Image src={project.coverImage} alt={project.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 text-border"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" className="w-full h-full"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg></div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                        <ArrowRight className="w-5 h-5 text-text-primary" />
                      </div>
                    </div>
                  </div>
                  <h2 className="font-serif text-2xl text-text-primary mb-3 group-hover:text-accent transition-colors duration-300">{project.title}</h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary mb-3">
                    {project.shootDate && (
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-text-muted" />{formatDate(project.shootDate)}</span>
                    )}
                    {project.location && (
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-text-muted" />{project.location}</span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted tracking-wide">{project._count.images} {project._count.images === 1 ? 'photograph' : 'photographs'}</p>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="max-w-8xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="text-sm text-text-primary font-serif">Andreas Boutsikas Photography</p>
            <p className="text-xs text-text-muted mt-1">Athens, Greece</p>
          </div>
          <a href="mailto:contact@andreasboutsikas.com" className="text-sm text-accent hover:underline">contact@andreasboutsikas.com</a>
        </div>
      </footer>
    </div>
  );
}

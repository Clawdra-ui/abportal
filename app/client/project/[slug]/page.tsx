import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { GalleryGrid } from "@/components/gallery";
import { formatDate } from "@/lib/utils";
import { MapPin, Calendar, ArrowLeft, Download, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const project = await prisma.project.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" } }, access: true },
  });

  if (!project) notFound();

  const hasAccess = session.user.role === "ADMIN" || project.access.some((a) => a.userId === session.user.id);
  if (!hasAccess) redirect("/client/dashboard");
  if (!project.published && session.user.role !== "ADMIN") notFound();

  const galleryImages = project.images.map((img) => ({
    id: img.id,
    src: img.filename.startsWith("/") ? img.filename : `/images/${img.filename}`,
    alt: "Gallery image",
  }));

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="fixed top-0 left-0 right-0 z-40 bg-bg-primary/98 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-8xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/client/dashboard" className="flex items-center gap-3 text-text-secondary hover:text-text-primary transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm">Back to galleries</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-muted hidden sm:block">{project.images.length} {project.images.length === 1 ? 'photograph' : 'photographs'}</span>
            {project.zipFile && (
              <a href={`/api/download/${project.id}`} className="inline-flex">
                <Button size="sm" className="gap-2"><Download className="w-4 h-4" /><span className="hidden sm:inline">Download</span></Button>
              </a>
            )}
          </div>
        </div>
      </header>

      <main>
        <div className="relative bg-bg-secondary pt-16">
          {project.coverImage && (
            <div className="absolute inset-0 overflow-hidden">
              <Image src={project.coverImage} alt={project.title} fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/70 via-bg-primary/50 to-bg-primary" />
            </div>
          )}
          <div className="relative z-10 max-w-8xl mx-auto px-6 py-20 md:py-28 lg:py-36">
            <div className="max-w-3xl animate-in">
              <p className="text-accent text-xs tracking-[0.2em] uppercase mb-6">Gallery</p>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-text-primary mb-8 leading-[1.05]">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-text-secondary mb-8">
                {project.shootDate && <span className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-text-muted" />{formatDate(project.shootDate)}</span>}
                {project.location && <span className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-text-muted" />{project.location}</span>}
              </div>
              {project.description && <p className="text-text-secondary text-lg md:text-xl leading-relaxed max-w-2xl">{project.description}</p>}
            </div>
          </div>
        </div>

        <div className="max-w-8xl mx-auto px-6 py-16 md:py-20">
          {project.zipFile && (
            <div className="flex justify-center mb-10 lg:hidden animate-in">
              <a href={`/api/download/${project.id}`} className="inline-flex w-full sm:w-auto">
                <Button size="lg" className="gap-2 w-full sm:w-auto"><Download className="w-5 h-5" />Download All Photos</Button>
              </a>
            </div>
          )}
          {galleryImages.length > 0 ? <GalleryGrid images={galleryImages} /> : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-16 h-16 mb-6 text-border"><ImageIcon className="w-full h-full" /></div>
              <p className="text-text-muted text-lg">No images in this gallery yet.</p>
            </div>
          )}
        </div>

        {project.zipFile && (
          <div className="border-t border-border bg-bg-secondary">
            <div className="max-w-8xl mx-auto px-6 py-14 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-serif text-2xl md:text-3xl text-text-primary mb-2">Download Collection</h3>
                <p className="text-text-secondary">{project.images.length} high-resolution {project.images.length === 1 ? 'photograph' : 'photographs'}</p>
              </div>
              <a href={`/api/download/${project.id}`} className="inline-flex">
                <Button size="lg" className="gap-3 h-14 px-8 text-base"><Download className="w-5 h-5" />Download ZIP</Button>
              </a>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border">
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

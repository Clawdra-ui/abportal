import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { saveZip } from "@/lib/storage";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("zip") as File;

    if (!file) {
      return NextResponse.json({ error: "No ZIP file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith(".zip")) {
      return NextResponse.json(
        { error: "File must be a ZIP archive" },
        { status: 400 }
      );
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 100MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const relativePath = await saveZip(project.slug, buffer, file.name);

    await prisma.project.update({
      where: { id },
      data: { zipFile: relativePath },
    });

    return NextResponse.json({ zipFile: relativePath }, { status: 201 });
  } catch (error) {
    console.error("Error uploading ZIP:", error);
    return NextResponse.json(
      { error: "Failed to upload ZIP file" },
      { status: 500 }
    );
  }
}

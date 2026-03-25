import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { saveImage } from "@/lib/storage";

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
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    // Get current max order
    const maxOrderImage = await prisma.image.findFirst({
      where: { projectId: id },
      orderBy: { order: "desc" },
    });
    let nextOrder = (maxOrderImage?.order ?? -1) + 1;

    const savedImages = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        continue;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const relativePath = await saveImage(project.slug, buffer, file.name);

      const image = await prisma.image.create({
        data: {
          filename: relativePath,
          projectId: id,
          order: nextOrder++,
        },
      });

      savedImages.push(image);
    }

    return NextResponse.json(savedImages, { status: 201 });
  } catch (error) {
    console.error("Error uploading images:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}

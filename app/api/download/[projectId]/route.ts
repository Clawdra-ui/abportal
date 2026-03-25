import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getZipPath } from "@/lib/storage";
import { createReadStream } from "fs";
import { stat } from "fs/promises";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        access: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check access
    const hasAccess =
      session.user.role === "ADMIN" ||
      project.access.some((a) => a.userId === session.user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!project.zipFile) {
      return NextResponse.json(
        { error: "No ZIP file available for this project" },
        { status: 404 }
      );
    }

    const zipPath = await getZipPath(project.slug);

    if (!zipPath) {
      return NextResponse.json(
        { error: "ZIP file not found" },
        { status: 404 }
      );
    }

    // Get file stats for content-length
    const fileStats = await stat(zipPath);
    const fileName = `${project.slug}.zip`;

    // Stream the file instead of loading into memory
    const readable = createReadStream(zipPath);

    // Convert Node.js ReadStream to Web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        readable.on("data", (chunk) => {
          controller.enqueue(chunk);
        });
        readable.on("end", () => {
          controller.close();
        });
        readable.on("error", (err) => {
          controller.error(err);
        });
      },
      cancel() {
        readable.destroy();
      },
    });

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileStats.size.toString(),
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("Error downloading ZIP:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}

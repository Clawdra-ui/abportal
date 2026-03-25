import { writeFile, mkdir, unlink, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const STORAGE_PATH = process.env.STORAGE_PATH || "/data/andreas-portal";
const IMAGES_DIR = path.join(STORAGE_PATH, "images");
const ZIP_DIR = path.join(STORAGE_PATH, "zips");

export async function ensureStorageDirs() {
  if (!existsSync(STORAGE_PATH)) {
    await mkdir(STORAGE_PATH, { recursive: true });
  }
  if (!existsSync(IMAGES_DIR)) {
    await mkdir(IMAGES_DIR, { recursive: true });
  }
  if (!existsSync(ZIP_DIR)) {
    await mkdir(ZIP_DIR, { recursive: true });
  }
}

export async function saveImage(
  projectSlug: string,
  file: Buffer,
  filename: string
): Promise<string> {
  // Validate slug format
  const safeSlug = projectSlug.replace(/[^a-zA-Z0-9-_]/g, "-").substring(0, 100);
  await ensureStorageDirs();
  const projectDir = path.join(IMAGES_DIR, safeSlug);

  // Reject if path traversal detected in slug
  if (projectDir.includes("..") || !projectDir.startsWith(IMAGES_DIR)) {
    throw new Error("Invalid project slug");
  }

  if (!existsSync(projectDir)) {
    await mkdir(projectDir, { recursive: true });
  }
  const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const filePath = path.join(projectDir, safeFilename);

  // Final path safety check before write
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(IMAGES_DIR)) {
    throw new Error("Invalid file path");
  }

  await writeFile(filePath, file);
  return `/images/${safeSlug}/${safeFilename}`;
}

export async function saveZip(
  projectSlug: string,
  file: Buffer,
  filename: string
): Promise<string> {
  // Validate slug format
  const safeSlug = projectSlug.replace(/[^a-zA-Z0-9-_]/g, "-").substring(0, 100);
  await ensureStorageDirs();
  const safeFilename = `${safeSlug}.zip`;
  const filePath = path.join(ZIP_DIR, safeFilename);

  // Path safety check before write
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(ZIP_DIR)) {
    throw new Error("Invalid zip path");
  }

  await writeFile(filePath, file);
  return `/zips/${safeFilename}`;
}

export async function deleteImage(imagePath: string): Promise<void> {
  // Ensure path doesn't escape storage directory
  const normalizedPath = path.normalize(imagePath);
  if (normalizedPath.includes("..")) {
    throw new Error("Invalid path");
  }
  const fullPath = path.join(STORAGE_PATH, normalizedPath);
  // Verify the path is within storage directory
  if (!fullPath.startsWith(STORAGE_PATH)) {
    throw new Error("Invalid path");
  }
  if (existsSync(fullPath)) {
    await unlink(fullPath);
  }
}

export async function getZipPath(projectSlug: string): Promise<string | null> {
  // Validate slug format
  const safeSlug = projectSlug.replace(/[^a-zA-Z0-9-_]/g, "-").substring(0, 100);
  const filePath = path.join(ZIP_DIR, `${safeSlug}.zip`);
  if (existsSync(filePath)) {
    return filePath;
  }
  return null;
}

export function getStoragePath(relativePath: string): string {
  return path.join(STORAGE_PATH, relativePath);
}

export async function fileExists(relativePath: string): Promise<boolean> {
  const fullPath = path.join(STORAGE_PATH, relativePath);
  try {
    await stat(fullPath);
    return true;
  } catch {
    return false;
  }
}

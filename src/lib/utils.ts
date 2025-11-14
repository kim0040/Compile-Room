import path from "node:path";
import { promises as fs } from "node:fs";
import { Buffer } from "node:buffer";

export function normalizeFilename(filename: string) {
  const extension = path.extname(filename);
  const base = path.basename(filename, extension);
  const safeBase = base
    .toLowerCase()
    .replace(/[^a-z0-9ㄱ-ㅎ가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 40);
  return `${safeBase || "file"}${extension.toLowerCase()}`;
}

export async function saveUpload(file: File, fileBuffer?: Buffer) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const normalizedName = normalizeFilename(file.name);
  const storedFileName = `${Date.now()}-${normalizedName}`;
  const filePath = path.join(uploadsDir, storedFileName);
  const buffer = fileBuffer ?? Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return {
    storedFileName,
    fileUrl: `/uploads/${storedFileName}`,
  };
}

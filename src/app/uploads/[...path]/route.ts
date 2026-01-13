import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
    request: Request,
    { params }: { params: { path: string[] } }
) {
    const filePath = params.path.join("/");
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const fullPath = path.join(uploadsDir, filePath);

    try {
        // Security check: ensure the file is within the uploads directory
        if (!fullPath.startsWith(uploadsDir)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const fileBuffer = await fs.readFile(fullPath);
        const ext = path.extname(fullPath).toLowerCase();

        const contentTypeMap: Record<string, string> = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".webp": "image/webp",
            ".svg": "image/svg+xml",
        };

        const contentType = contentTypeMap[ext] || "application/octet-stream";

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error(`Failed to serve image: ${filePath}`, error);
        return new NextResponse("Not Found", { status: 404 });
    }
}

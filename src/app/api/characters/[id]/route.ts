import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { characters } from "@/db/schema";
import { eq } from "drizzle-orm";
import { s3Client, S3_BUCKET_NAME } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Get character to find image URL
        const char = await db.query.characters.findFirst({
            where: eq(characters.id, id),
        });

        if (char) {
            const fileName = char.imageUrl.split("/").pop();
            if (fileName) {
                if (char.imageUrl.startsWith("http") && s3Client) {
                    // Delete from S3
                    await s3Client.send(
                        new DeleteObjectCommand({
                            Bucket: S3_BUCKET_NAME,
                            Key: fileName,
                        })
                    );
                } else if (char.imageUrl.startsWith("/uploads/")) {
                    // Delete from local
                    const { unlink } = await import("fs/promises");
                    const path = await import("path");
                    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
                    try {
                        await unlink(filePath);
                    } catch (e) {
                        console.error("Error deleting local file:", e);
                    }
                }
            }

            // 3. Delete from DB (cascade handles forbidden words)
            await db.delete(characters).where(eq(characters.id, id));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting character:", error);
        return NextResponse.json({ error: "Failed to delete character" }, { status: 500 });
    }
}

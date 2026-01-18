import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { characters } from "@/db/schema";
import { eq } from "drizzle-orm";
import { s3Client, S3_BUCKET_NAME } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { saveImage, processCharacter } from "@/lib/character-utils";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await req.formData();
        const name = formData.get("name") as string;
        const forbiddenWordsInput = formData.get("forbiddenWords") as string;
        const imageFile = formData.get("image") as File | null;
        const setIdsInput = formData.get("setIds") as string;

        // 1. Get existing character to check for current image
        const existingCharacter = await db.query.characters.findFirst({
            where: eq(characters.id, id),
        });

        if (!existingCharacter) {
            return NextResponse.json({ error: "Character not found" }, { status: 404 });
        }

        let imageUrl = existingCharacter.imageUrl;

        // 2. If a new image is uploaded, save it and optionally delete the old one
        if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            imageUrl = await saveImage(buffer, imageFile.name, imageFile.type);

            // Note: We could delete the old image here, but it's safer to keep for now or implement as a cleanup task
        }

        // 3. Update character
        const words = forbiddenWordsInput ? JSON.parse(forbiddenWordsInput) as string[] : undefined;
        const setIds = setIdsInput ? JSON.parse(setIdsInput) as string[] : undefined;
        const updatedCharacter = await processCharacter(name || existingCharacter.name, imageUrl, words, id, setIds);

        return NextResponse.json(updatedCharacter);
    } catch (error) {
        console.error("Error updating character:", error);
        return NextResponse.json({ error: "Failed to update character" }, { status: 500 });
    }
}

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

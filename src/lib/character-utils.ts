import { db } from "@/db";
import { characters, forbiddenWords } from "@/db/schema";
import { s3Client, S3_BUCKET_NAME, S3_PUBLIC_URL } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

export async function saveImage(imageBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
    const fileExtension = fileName.split(".").pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    let imageUrl = "";

    if (s3Client) {
        await s3Client.send(
            new PutObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: uniqueFileName,
                Body: imageBuffer,
                ContentType: contentType,
            })
        );
        imageUrl = `${S3_PUBLIC_URL}/${uniqueFileName}`;
    } else {
        const { writeFile, mkdir } = await import("fs/promises");
        const path = await import("path");
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        // Ensure upload directory exists
        await mkdir(uploadDir, { recursive: true });

        await writeFile(path.join(uploadDir, uniqueFileName), imageBuffer);
        imageUrl = `/uploads/${uniqueFileName}`;
    }

    return imageUrl;
}

export async function processCharacter(name: string, imageUrl: string, forbiddenWordsList?: string[], id?: string) {
    // Check if character exists
    let existingCharacter;
    if (id) {
        existingCharacter = await db.query.characters.findFirst({
            where: (characters, { eq }) => eq(characters.id, id),
        });
    } else {
        existingCharacter = await db.query.characters.findFirst({
            where: (characters, { eq }) => eq(characters.name, name),
        });
    }

    let character;

    if (existingCharacter) {
        // Update existing
        [character] = await db.update(characters)
            .set({ imageUrl })
            .where(eq(characters.id, existingCharacter.id))
            .returning();

        // Delete old forbidden words
        await db.delete(forbiddenWords).where(eq(forbiddenWords.characterId, character.id));
    } else {
        // Create new
        [character] = await db.insert(characters).values({
            name,
            imageUrl,
        }).returning();
    }

    // Insert forbidden words
    if (forbiddenWordsList && forbiddenWordsList.length > 0) {
        await db.insert(forbiddenWords).values(
            forbiddenWordsList.map((word) => ({
                characterId: character.id,
                word: word.trim(),
            }))
        );
    }

    return character;
}

export async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to download image from ${url}. Status: ${res.status}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const fileName = new URL(url).pathname.split("/").pop() || "image.jpg";

    return { buffer, contentType, fileName };
}

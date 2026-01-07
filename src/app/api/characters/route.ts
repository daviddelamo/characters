import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { characters, forbiddenWords } from "@/db/schema";
import { s3Client, S3_BUCKET_NAME, S3_PUBLIC_URL } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const name = formData.get("name") as string;
        const image = formData.get("image") as File;
        const forbiddenWordsInput = formData.get("forbiddenWords") as string; // JSON string array

        if (!name || !image) {
            return NextResponse.json({ error: "Name and image are required" }, { status: 400 });
        }

        // 1. Upload image (S3 or Local)
        const fileExtension = image.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        let imageUrl = "";

        if (s3Client) {
            const buffer = Buffer.from(await image.arrayBuffer());
            await s3Client.send(
                new PutObjectCommand({
                    Bucket: S3_BUCKET_NAME,
                    Key: fileName,
                    Body: buffer,
                    ContentType: image.type,
                })
            );
            imageUrl = `${S3_PUBLIC_URL}/${fileName}`;
        } else {
            const { writeFile } = await import("fs/promises");
            const path = await import("path");
            const buffer = Buffer.from(await image.arrayBuffer());
            const uploadDir = path.join(process.cwd(), "public", "uploads");
            await writeFile(path.join(uploadDir, fileName), buffer);
            imageUrl = `/uploads/${fileName}`;
        }


        // 2. Insert into DB
        const [newCharacter] = await db.insert(characters).values({
            name,
            imageUrl,
        }).returning();

        // 3. Insert forbidden words
        if (forbiddenWordsInput) {
            const words = JSON.parse(forbiddenWordsInput) as string[];
            if (words.length > 0) {
                await db.insert(forbiddenWords).values(
                    words.map((word) => ({
                        characterId: newCharacter.id,
                        word: word.trim(),
                    }))
                );
            }
        }

        return NextResponse.json(newCharacter);
    } catch (error) {
        console.error("Error creating character:", error);
        return NextResponse.json({ error: "Failed to create character" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const allCharacters = await db.query.characters.findMany({
            with: {
                forbiddenWords: true,
            },
        });
        return NextResponse.json(allCharacters);
    } catch (error) {
        console.error("Error fetching characters:", error);
        return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
    }
}

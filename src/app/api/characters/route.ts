import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { saveImage, processCharacter } from "@/lib/character-utils";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const name = formData.get("name") as string;
        const image = formData.get("image") as File | null;
        const imageUrlParam = formData.get("imageUrl") as string | null;
        const forbiddenWordsInput = formData.get("forbiddenWords") as string; // JSON string array
        const setIdsInput = formData.get("setIds") as string; // JSON string array

        if (!name || (!image && !imageUrlParam)) {
            return NextResponse.json({ error: "Name and image (file or URL) are required" }, { status: 400 });
        }

        // 1. Save image
        let imageUrl: string;

        if (imageUrlParam) {
            // Download from URL
            const { downloadImage } = await import("@/lib/character-utils");
            try {
                const { buffer, contentType, fileName } = await downloadImage(imageUrlParam);
                imageUrl = await saveImage(buffer, fileName, contentType);
            } catch (error) {
                console.error("Failed to download image from URL:", error);
                return NextResponse.json({ error: "Failed to download image from URL" }, { status: 400 });
            }
        } else if (image) {
            // Use uploaded file
            const buffer = Buffer.from(await image.arrayBuffer());
            imageUrl = await saveImage(buffer, image.name, image.type);
        } else {
            // Should not happen due to check above
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // 2. Process character (Create or Update)
        const words = forbiddenWordsInput ? JSON.parse(forbiddenWordsInput) as string[] : [];
        const setIds = setIdsInput ? JSON.parse(setIdsInput) as string[] : [];
        const character = await processCharacter(name, imageUrl, words, undefined, setIds);

        return NextResponse.json(character);
    } catch (error) {
        console.error("Error creating/updating character:", error);
        return NextResponse.json({ error: "Failed to create/update character" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const allCharacters = await db.query.characters.findMany({
            with: {
                forbiddenWords: true,
                sets: {
                    with: {
                        set: true,
                    }
                }
            },
        });
        return NextResponse.json(allCharacters);
    } catch (error) {
        console.error("Error fetching characters:", error);
        return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
    }
}

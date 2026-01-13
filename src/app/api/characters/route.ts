import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { saveImage, processCharacter } from "@/lib/character-utils";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const name = formData.get("name") as string;
        const image = formData.get("image") as File;
        const forbiddenWordsInput = formData.get("forbiddenWords") as string; // JSON string array

        if (!name || !image) {
            return NextResponse.json({ error: "Name and image are required" }, { status: 400 });
        }

        // 1. Save image
        const buffer = Buffer.from(await image.arrayBuffer());
        const imageUrl = await saveImage(buffer, image.name, image.type);

        // 2. Process character (Create or Update)
        const words = forbiddenWordsInput ? JSON.parse(forbiddenWordsInput) as string[] : [];
        const character = await processCharacter(name, imageUrl, words);

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
            },
        });
        return NextResponse.json(allCharacters);
    } catch (error) {
        console.error("Error fetching characters:", error);
        return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
    }
}

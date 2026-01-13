import { NextRequest, NextResponse } from "next/server";
import { downloadImage, saveImage, processCharacter } from "@/lib/character-utils";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const content = await file.text();
        const characters = JSON.parse(content);

        if (!Array.isArray(characters)) {
            return NextResponse.json({ error: "Invalid JSON format. Expected an array of characters." }, { status: 400 });
        }

        const results = [];
        for (const char of characters) {
            try {
                let imageUrl = char.image;

                // If it's a URL, download it and save it locally/S3
                if (char.image && (char.image.startsWith("http://") || char.image.startsWith("https://"))) {
                    const { buffer, contentType, fileName } = await downloadImage(char.image);
                    imageUrl = await saveImage(buffer, fileName, contentType);
                }

                const processed = await processCharacter(char.name, imageUrl, char.forbiddenWords);
                results.push({ name: char.name, status: "success", id: processed.id });
            } catch (err: any) {
                console.error(`Error processing character ${char.name}:`, err);
                results.push({ name: char.name, status: "error", error: err.message });
            }
        }

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Error in bulk upload:", error);
        return NextResponse.json({ error: "Failed to process bulk upload" }, { status: 500 });
    }
}

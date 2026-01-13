import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const API_URL = "http://localhost:3000/api/characters";

interface CharacterData {
    name: string;
    image: string; // path to image file
    forbiddenWords: string[];
}

async function bulkLoad() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("Usage: npx tsx scripts/bulk-load.ts <path-to-json-file>");
        process.exit(1);
    }

    const configPath = path.resolve(args[0]);
    if (!fs.existsSync(configPath)) {
        console.error(`File not found: ${configPath}`);
        process.exit(1);
    }

    const characters: CharacterData[] = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const configDir = path.dirname(configPath);

    console.log(`Starting bulk load of ${characters.length} characters...\n`);

    for (const char of characters) {
        try {
            console.log(`Processing: ${char.name}...`);

            const isUrl = char.image.startsWith("http://") || char.image.startsWith("https://");
            let blob: Blob;
            let fileName: string;

            if (isUrl) {
                console.log(`  Downloading image from URL: ${char.image}`);
                const imgRes = await fetch(char.image);
                if (!imgRes.ok) {
                    console.error(`  Error: Failed to download image from ${char.image}. Status: ${imgRes.status}`);
                    continue;
                }
                const buffer = await imgRes.arrayBuffer();
                fileName = path.basename(new URL(char.image).pathname) || "image.jpg";
                const contentType = imgRes.headers.get("content-type") || getMimeType(fileName);
                blob = new Blob([buffer], { type: contentType });
            } else {
                const imagePath = path.isAbsolute(char.image)
                    ? char.image
                    : path.resolve(configDir, char.image);

                if (!fs.existsSync(imagePath)) {
                    console.error(`  Error: Image not found at ${imagePath}`);
                    continue;
                }

                const fileBuffer = fs.readFileSync(imagePath);
                fileName = path.basename(imagePath);
                blob = new Blob([fileBuffer], { type: getMimeType(fileName) });
            }

            const formData = new FormData();
            formData.append("name", char.name);
            formData.append("forbiddenWords", JSON.stringify(char.forbiddenWords));
            formData.append("image", blob, fileName);

            const response = await fetch(API_URL, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                console.log(`  Success: Character created with ID ${result.id}`);
            } else {
                const error = await response.text();
                console.error(`  Error: Failed to create character. Status: ${response.status}, ${error}`);
            }
        } catch (err) {
            console.error(`  Error processing ${char.name}:`, err);
        }
    }

    console.log("\nBulk load finished.");
}

function getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
        case ".png": return "image/png";
        case ".jpg":
        case ".jpeg": return "image/jpeg";
        case ".webp": return "image/webp";
        case ".gif": return "image/gif";
        default: return "application/octet-stream";
    }
}

bulkLoad();

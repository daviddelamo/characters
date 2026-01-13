import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
    try {
        const cwd = process.cwd();
        const publicPath = path.join(cwd, "public");
        const uploadsPath = path.join(publicPath, "uploads");

        let publicExists = false;
        let uploadsExists = false;
        let uploadsFiles: string[] = [];

        try {
            await fs.access(publicPath);
            publicExists = true;
        } catch { }

        try {
            await fs.access(uploadsPath);
            uploadsExists = true;
            uploadsFiles = await fs.readdir(uploadsPath);
        } catch { }

        return NextResponse.json({
            cwd,
            publicPath,
            uploadsPath,
            publicExists,
            uploadsExists,
            uploadsFiles,
            env: {
                NODE_ENV: process.env.NODE_ENV,
                PORT: process.env.PORT,
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

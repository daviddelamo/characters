import { NextResponse } from "next/server";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@/db";
import path from "path";

export async function POST() {
    try {
        // In local dev, it might be in ./drizzle
        // In Docker production (next standalone), it might be different, 
        // but we copied it to /app/drizzle which is process.cwd() / drizzle
        await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });

        return NextResponse.json({ message: "Database schema synchronized successfully" });
    } catch (error: any) {
        console.error("Migration error:", error);
        return NextResponse.json(
            { error: "Failed to sync database schema", details: error.message },
            { status: 500 }
        );
    }
}

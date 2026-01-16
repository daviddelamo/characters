import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await db.query.characters.findFirst({
            with: {
                forbiddenWords: true, // Helper relation must be defined in schema
            },
            orderBy: sql`RANDOM()`,
        });

        if (!result) {
            return NextResponse.json({ error: "No characters found" }, { status: 404 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching random character:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

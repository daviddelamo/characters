import { NextResponse } from "next/server";
import { db } from "@/db";
import { games } from "@/db/schema";

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({})); // Handle empty body if any
        const { allowedSets, includeNoSet } = body;

        const [newGame] = await db.insert(games).values({
            allowedSets: allowedSets || null,
            includeNoSet: includeNoSet !== undefined ? String(includeNoSet) : "true",
        }).returning();
        return NextResponse.json(newGame);
    } catch (error) {
        console.error("Error creating game:", error);
        return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
    }
}

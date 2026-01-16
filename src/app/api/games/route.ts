import { NextResponse } from "next/server";
import { db } from "@/db";
import { games } from "@/db/schema";

export async function POST() {
    try {
        const [newGame] = await db.insert(games).values({}).returning();
        return NextResponse.json(newGame);
    } catch (error) {
        console.error("Error creating game:", error);
        return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
    }
}

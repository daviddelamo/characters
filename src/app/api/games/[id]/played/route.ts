import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { playedCharacters } from "@/db/schema";

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const gameId = params.id;
        const body = await req.json();
        const { characterId } = body;

        if (!characterId) {
            return NextResponse.json({ error: "characterId is required" }, { status: 400 });
        }

        await db.insert(playedCharacters).values({
            gameId,
            characterId,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking character as played:", error);
        return NextResponse.json({ error: "Failed to mark character as played" }, { status: 500 });
    }
}

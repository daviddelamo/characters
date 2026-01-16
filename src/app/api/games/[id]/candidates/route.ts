import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { characters, playedCharacters } from "@/db/schema";
import { eq, notInArray } from "drizzle-orm";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const gameId = params.id;

        // 1. Get IDs of characters already played in this game
        const played = await db.query.playedCharacters.findMany({
            where: eq(playedCharacters.gameId, gameId),
            columns: {
                characterId: true,
            },
        });

        const playedIds = played.map((p) => p.characterId);

        // 2. Fetch characters NOT in that list
        let availableCharacters;

        if (playedIds.length > 0) {
            availableCharacters = await db.query.characters.findMany({
                where: notInArray(characters.id, playedIds),
                with: {
                    forbiddenWords: true,
                },
            });
        } else {
            // No characters played yet, return all
            availableCharacters = await db.query.characters.findMany({
                with: {
                    forbiddenWords: true,
                },
            });
        }

        return NextResponse.json(availableCharacters);

    } catch (error) {
        console.error("Error fetching candidates:", error);
        return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
    }
}

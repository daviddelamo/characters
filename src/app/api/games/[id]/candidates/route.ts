import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { characters, playedCharacters, games, characterSets } from "@/db/schema";
import { eq, notInArray, and, or, inArray, exists, notExists } from "drizzle-orm";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const gameId = params.id;

        // 0. Get Game Config
        const game = await db.query.games.findFirst({
            where: eq(games.id, gameId),
        });

        if (!game) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        const allowedSets = game.allowedSets as string[] | null;
        const includeNoSet = game.includeNoSet === "true";

        // 1. Get IDs of characters already played in this game
        const played = await db.query.playedCharacters.findMany({
            where: eq(playedCharacters.gameId, gameId),
            columns: {
                characterId: true,
            },
        });

        const playedIds = played.map((p) => p.characterId);

        // 2. Build Where Clause
        const filters = [];

        // Exclude played characters
        if (playedIds.length > 0) {
            filters.push(notInArray(characters.id, playedIds));
        }

        // Set filtering
        const setConditions = [];

        if (allowedSets && allowedSets.length > 0) {
            // Characters belonging to one of the allowed sets
            // We use a subquery existence check
            setConditions.push(
                exists(
                    db.select()
                        .from(characterSets)
                        .where(and(
                            eq(characterSets.characterId, characters.id),
                            inArray(characterSets.setId, allowedSets)
                        ))
                )
            );
        }

        if (includeNoSet) {
            // Characters with NO sets
            setConditions.push(
                notExists(
                    db.select()
                        .from(characterSets)
                        .where(eq(characterSets.characterId, characters.id))
                )
            );
        }

        // If we have specific set requirements (either restricted sets or we strictly only want no-set ones)
        // If allowedSets is empty/null AND includeNoSet is true => We allow everything (default behavior usually?)
        // Wait, if allowedSets is empty and includeNoSet is true, it sounds like "Only those with no set".
        // BUT usually "Select sets to play" implies if nothing selected, maybe nothing plays?
        // Or "includeNoSet" is a checkbox.
        // Let's assume if nothing is selected (allowedSets empty) and includeNoSet is false, result is empty.
        // If nothing selected and includeNoSet is true, result is only those without sets.

        // However, if the user didn't configure anything (old games), allowedSets is null.
        // Let's treat null allowedSets as "All sets allowed" ???
        // No, the UI will likely force a selection or default to something.
        // But for backward compatibility? valid question.
        // Given 'allowedSets' is newly added, old rows have null. 
        // If allowedSets is null, maybe we should treat it as "No restriction".

        if (allowedSets !== null || !includeNoSet) {
            // If connection to sets criteria is defined, apply it.
            if (setConditions.length > 0) {
                filters.push(or(...setConditions));
            } else {
                // No conditions met (e.g. allowedSets empty AND includeNoSet false) -> No characters
                // We can simulate this by a failing condition or returning empty array immediately.
                return NextResponse.json([]);
            }
        }


        // 3. Fetch Characters
        const availableCharacters = await db.query.characters.findMany({
            where: and(...filters),
            with: {
                forbiddenWords: true,
            },
        });

        return NextResponse.json(availableCharacters);

    } catch (error) {
        console.error("Error fetching candidates:", error);
        return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
    }
}

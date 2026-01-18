
import { db } from "@/db";
import { sets } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const allSets = await db.select().from(sets).orderBy(sets.createdAt);
        return NextResponse.json(allSets);
    } catch (error) {
        console.error("Error fetching sets:", error);
        return NextResponse.json(
            { error: "Failed to fetch sets" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        const [newSet] = await db.insert(sets).values({ name }).returning();
        return NextResponse.json(newSet);
    } catch (error) {
        console.error("Error creating set:", error);
        return NextResponse.json(
            { error: "Failed to create set" },
            { status: 500 }
        );
    }
}

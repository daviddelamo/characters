
import { db } from "@/db";
import { sets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        const [updatedSet] = await db
            .update(sets)
            .set({ name })
            .where(eq(sets.id, id))
            .returning();

        if (!updatedSet) {
            return NextResponse.json({ error: "Set not found" }, { status: 404 });
        }

        return NextResponse.json(updatedSet);
    } catch (error) {
        console.error("Error updating set:", error);
        return NextResponse.json(
            { error: "Failed to update set" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const [deletedSet] = await db
            .delete(sets)
            .where(eq(sets.id, id))
            .returning();

        if (!deletedSet) {
            return NextResponse.json({ error: "Set not found" }, { status: 404 });
        }

        return NextResponse.json(deletedSet);
    } catch (error) {
        console.error("Error deleting set:", error);
        return NextResponse.json(
            { error: "Failed to delete set" },
            { status: 500 }
        );
    }
}

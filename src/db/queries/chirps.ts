import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createChirp(chirp: NewChirp) {
    const [row] = await db 
        .insert(chirps)
        .values(chirp)
        .onConflictDoNothing()
        .returning();
    return row;
}

export async function deleteChirps() {
    await db.delete(chirps);
}

export async function getChirps() {
    const rows = await db.select().from(chirps).orderBy(chirps.createdAt);
    return rows;
}

export async function getChirpById(id: string) {
    const [row] = await db.select().from(chirps).where(eq(chirps.id, id));
    return row;
}
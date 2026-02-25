import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

export async function createUser(user: NewUser) {
    const [row] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    return row;
}

export async function getUserByEmail(email: string) {
    const [row] = await db.select().from(users).where(eq(users.email, email));
    return row; 
}

export async function deleteUsers() {
    await db.delete(users);
}
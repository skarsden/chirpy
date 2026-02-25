import * as argon2 from "argon2"

export async function hashPassword(password: string): Promise<string> {
    try {
        return await argon2.hash(password);
    } catch (err) {
        return `Error hashing password: ${err}`
    }
}

export async function checkPassowrdHash(password: string, hash: string): Promise<boolean> {
    try {
        return await argon2.verify(hash, password);
    } catch (err) {
        console.log(`Something went wrong verifying password: ${err}`);
        return false;
    }
}
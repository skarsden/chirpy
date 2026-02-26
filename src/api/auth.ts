import * as argon2 from "argon2"
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { Request } from "express";
import { config } from "../config.js"
import crypto from "crypto";

export async function hashPassword(password: string): Promise<string> {
    try {
        return await argon2.hash(password);
    } catch (err) {
        return `Error hashing password: ${err}`
    }
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    try {
        return await argon2.verify(hash, password);
    } catch (err) {
        console.log(`Something went wrong verifying password: ${err}`);
        return false;
    }
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userId: string, expiresIn: number, secret: string) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + expiresIn;
    const token = jwt.sign(
        {
            iss: config.jwt.issuer,
            sub: userId,
            iat: issuedAt,
            exp: expiresAt,
        } satisfies payload,
        secret,
        { algorithm: "HS256" },
    );
    return token
}

export function validateJWT(tokenString: string, secret: string) {
    let decoded: payload;
    try {
        decoded = jwt.verify(tokenString, secret) as JwtPayload;
    } catch (err) {
        throw new UnauthorizedError("Invalid token");
    }

    if (decoded.iss !== config.jwt.issuer) {
        throw new UnauthorizedError("Invalid issuer");
    }
    if (!decoded.sub) {
        throw new UnauthorizedError("No user ID in token");
    }

    return decoded.sub;
}

export function getBearerToken(req: Request) {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        throw new BadRequestError("Malformed Authorization header");
    }

    const splitAuth = authHeader.split(" ");
    if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
        throw new BadRequestError("Malformed Authorization header");
    }
    return splitAuth[1];
}

export function makeRefreshToken() {
    const bytes = crypto.randomBytes(32);
    return bytes.toString('hex');
}
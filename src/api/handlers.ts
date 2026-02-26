import { Response, Request } from "express";
import { config } from "../config.js";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";
import { createUser, deleteUsers, getUserByEmail } from "../db/queries/users.js";
import { createChirp, getChirpById, getChirps } from "../db/queries/chirps.js";
import { NewUser } from "../db/schema.js";
import { checkPasswordHash, getBearerToken, hashPassword, makeJWT, makeRefreshToken, validateJWT } from "./auth.js";
import { revokeRefreshToken, saveRefreshToken, userForRefreshToken } from "../db/queries/refresh.js";

export async function handlerMetrics(_: Request, res: Response) {
    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(`<html>
    <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
    </body>
</html>`);
}

export async function handlerReadiness(_: Request, res: Response) {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}

export async function handlerReset(_: Request, res: Response) {
    if(config.api.platform !== "dev") {
        throw new ForbiddenError("Reset is only allowed in dev environment.");
    }
    config.api.fileserverHits = 0;
    await deleteUsers();
    res.write("Hits reset to 0");
    res.end();
}

export async function handlerAddChirp(req: Request, res: Response) {
    const params: { body: string } = req.body;
    if (!params.body) {
        throw new BadRequestError("Missing required field");
    }
    if (params.body.length > 140) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    const token = getBearerToken(req);
    const userId = validateJWT(token, config.jwt.secret);

    const words = params.body.split(" ");
    for (let i = 0; i < words.length; i++) {
        if (words[i].toLowerCase() === "kerfuffle" || words[i].toLowerCase() === "sharbert" || words[i].toLowerCase() === "fornax") {
            words[i] = "****";
        }
    }
    const cleanedBody = words.join(" ");

    const chirp = await createChirp({ body: cleanedBody, userId: userId });
    if (!chirp) {
        throw new Error("Could not create chirp");
    }

    if(!validateJWT(token, config.jwt.secret)) {
        throw new UnauthorizedError("Incorrent token");
    }

    res.header("Content-Type", "application/json");
    res.status(201).send({ 
        id: chirp.id,
        createdAt: chirp.createdAt,
        updatedAt: chirp.updatedAt,
        body: cleanedBody,
        userId: chirp.userId
     });
}

export async function handlerGetChirps(req: Request, res: Response) {
    const rows = await getChirps();
    res.header("Content-Type", "application/json");
    res.status(200).send(rows);
}

export async function handlerGetChirpById(req: Request, res: Response, chirpId: string) {
    const row = await getChirpById(chirpId)
    if(!row) {
        throw new NotFoundError(`Chirp with id ${chirpId} does not exist`);
    }
    res.header("Content-Type", "application/json");
    res.status(200).send({
        id: row.id,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        body: row.body,
        userId: row.userId
    });
}

export async function handlerAddUser(req: Request, res: Response) {
    const params: { email: string, password: string } = req.body;
    if (!params.email) {
        throw new BadRequestError("Missing required field");
    }

    const user: Omit<NewUser, "hashedPassword"> = await createUser({ email: params.email, hashedPassword: await hashPassword(params.password) });
    if (!user) {
        throw new Error("Could not create user");
    }

    res.header("Content-Type", "application/json");
    res.status(201).send({ 
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });
}

export async function handlerLogin(req: Request, res: Response) {
    const params: { email: string, password: string } = req.body;
    if (!params.email || !params.password) {
        throw new BadRequestError("Missing required fields")
    }

    const user  = await getUserByEmail(params.email);
    if (!user || await checkPasswordHash(params.password, user.hashedPassword) === false) {
        throw new UnauthorizedError("incorrect email or password");
    }

    const accessToken = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);
    const refreshToken = makeRefreshToken();

    const saved = await saveRefreshToken(user.id, refreshToken);
    if (!saved) {
        throw new UnauthorizedError("Could not save refresh token");
    }

    res.header("Content-Type", "application/json");
    res.status(200).send({
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email,
        token: accessToken,
        refreshToken: refreshToken
    });
}

export async function handlerRefresh(req: Request, res: Response) {
    let refreshToken = getBearerToken(req);

    const result = await userForRefreshToken(refreshToken);
    if (!result) {
        throw new UnauthorizedError("invalid refesh token");
    }

    const user = result.user;
    const accessToken = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);
    
    res.header("Content-Type", "application/json");
    res.status(200).send({ token: accessToken });
}

export async function handlerRevoke(req: Request, res: Response) {
    const refreshToken = getBearerToken(req);
    await revokeRefreshToken(refreshToken);
    res.status(204).send();
}
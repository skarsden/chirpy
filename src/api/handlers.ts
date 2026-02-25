import { Response, Request } from "express";
import { config } from "../config.js";
import { BadRequestError, ForbiddenError } from "./errors.js";
import { createUser, deleteUsers } from "../db/queries/users.js";

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
        throw new ForbiddenError("Reset is onbly allowed in dev environment.");
    }
    config.api.fileserverHits = 0;
    await deleteUsers();
    res.write("Hits reset to 0");
    res.end();
}

export async function handlerValidate(req: Request, res: Response) {
    const params: { body: string } = req.body;
    if (params.body.length > 140) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    const words = params.body.split(" ");
    for (let i = 0; i < words.length; i++) {
        if (words[i].toLowerCase() === "kerfuffle" || words[i].toLowerCase() === "sharbert" || words[i].toLowerCase() === "fornax") {
            words[i] = "****";
        }
    }
    const cleanedBody = words.join(" ");

    res.header("Content-Type", "application/json");
    res.status(200).send({ cleanedBody: cleanedBody });
}

export async function handlerAddUser(req: Request, res: Response) {
    const params: { email: string } = req.body;
    if (!params.email) {
        throw new BadRequestError("Missing required field");
    }

    const user = await createUser({ email: params.email });
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
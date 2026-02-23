import { Response, Request } from "express";
import { config } from "../config.js";
import { BadRequestError } from "./errors.js";

export async function handlerMetrics(_: Request, res: Response) {
    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(`<html>
    <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${config.fileserverHits} times!</p>
    </body>
</html>`);
}

export async function handlerReadiness(_: Request, res: Response) {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}

export async function handlerReset(_: Request, res: Response) {
    config.fileserverHits = 0;
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
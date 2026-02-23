import { Response, Request } from "express";
import { config } from "../config.js";

export async function handlerMetrics(_: Request, res: Response) {
    res.send(`Hits: ${config.fileserverHits}`);
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
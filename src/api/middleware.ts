import { NextFunction, Response, Request } from "express";
import { config } from "../config.js"
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from "./errors.js";

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        const statusCode = res.statusCode;
        if (statusCode > 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
        }
    });
    next();
}

export function middlewareMetricsInc(_: Request, __: Response, next: NextFunction) {
    config.fileserverHits++;
    next();
}

export function errorMiddleWare(err: Error, _: Request, res: Response, __: NextFunction) {
    let statusCode = 500;
    let message = "Something went wrong on our end";
    if (err instanceof BadRequestError) {
        statusCode = 400;
        message = err.message;
        console.log("ping");
    } else if (err instanceof UnauthorizedError) {
        statusCode = 401;
        message = err.message;
        console.log("ping");
    } else if (err instanceof ForbiddenError) {
        statusCode = 403;
        message = err.message;
        console.log("ping");
    } else if (err instanceof NotFoundError) {
        statusCode = 404;
        message = err.message;
        console.log("ping");
    }
    console.log(err.message)
    res.header("Content-Type", "application/json");
    res.status(statusCode).send(JSON.stringify({ error: message }));
}
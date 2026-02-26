import express from "express";
import { middlewareLogResponses, middlewareMetricsInc, errorMiddleWare } from "./api/middleware.js";
import { handlerAddChirp, handlerAddUser, handlerGetChirpById, handlerGetChirps, handlerLogin, handlerMetrics, handlerReadiness, handlerRefresh, handlerReset, handlerRevoke } from "./api/handlers.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(middlewareLogResponses);
app.use(express.json());
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", (req, res, next) => {
    Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.get("/admin/metrics", (req, res, next) => {
    Promise.resolve(handlerMetrics(req, res)).catch(next);
});
app.post("/admin/reset", (req, res, next) => {
    Promise.resolve(handlerReset(req, res)).catch(next);
});

app.post("/api/users", (req, res, next) => {
    Promise.resolve(handlerAddUser(req, res)).catch(next);
});
app.post("/api/login", (req, res, next) => {
    Promise.resolve(handlerLogin(req, res)).catch(next);
});
app.post("/api/refresh", (req, res, next) => {
    Promise.resolve(handlerRefresh(req, res)).catch(next);
})
app.post("/api/revoke", (req, res, next) => {
    Promise.resolve(handlerRevoke(req, res)).catch(next);
})

app.post("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerAddChirp(req, res)).catch(next);
});
app.get("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerGetChirps(req, res)).catch(next);
});
app.get("/api/chirps/:chirpId", (req, res, next) => {
    Promise.resolve(handlerGetChirpById(req, res, req.params.chirpId)).catch(next);
});


app.use(errorMiddleWare);

app.listen(config.api.port, () => {
    console.log(`Server is running at http://localhost:${config.api.port}`);
});

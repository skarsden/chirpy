import express from "express";
import { middlewareLogResponses, middlewareMetricsInc, errorMiddleWare } from "./api/middleware.js";
import { handlerMetrics, handlerReadiness, handlerReset, handlerValidate } from "./api/handlers.js";

const app = express();
const PORT = 8080;

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
app.post("/api/validate_chirp", (req, res, next) => {
    Promise.resolve(handlerValidate(req, res)).catch(next);
});

app.use(errorMiddleWare);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

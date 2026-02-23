import express from "express";
import { middlewareLogResponses, middlewareMetricsInc } from "./middleware.js";
import { handlerMetrics, handlerReadiness, handlerReset } from "./api/handlers.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/metrics", handlerMetrics);
app.get("/api/healthz", handlerReadiness);
app.get("/api/reset", handlerReset);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

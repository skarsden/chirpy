import express from "express";
import { middlewareLogResponses, middlewareMetricsInc } from "./middleware.js";
import { handlerMetrics, handlerReadiness, handlerReset, handlerValidate } from "./api/handlers.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use(express.json());
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", handlerValidate);
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

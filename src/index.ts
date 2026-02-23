import express from "express";
import { Request, Response } from "express";
import { middlewareLogResponses } from "./middleware.js";

const app = express();
const PORT = 8080;

app.use("/app", express.static("./src/app"));
app.use(middlewareLogResponses);

app.get("/healthz", async (_, resp) => {
    resp.set("Content-Type", "text/plain; charset=utf-8");
    resp.send("OK")
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

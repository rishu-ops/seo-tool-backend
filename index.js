import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";

import textRoutes from "./routes/text.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors("*"));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
  })
);

// Routes
app.use("/api/text", textRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ status: "Server is running (ESM mode)." });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

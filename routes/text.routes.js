import { Router } from "express";
import { instantToolController } from "../controllers/instantToolController.js";
import { aiToolController } from "../controllers/aiToolController.js";

const router = Router();

// Non-AI instant text tools
router.post("/instant", instantToolController);

// AI-powered text tools
router.post("/ai", aiToolController);


export default router;

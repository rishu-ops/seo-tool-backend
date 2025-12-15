import { Router } from "express";
import { textToolController } from "../controllers/textController.js";

const router = Router();

router.post("/generate", textToolController);

export default router;


import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { analyzeFinances } from "../controllers/aiController.js";

const router = express.Router();

// All AI routes require authentication
router.post("/analyze", protect, analyzeFinances);

export default router;

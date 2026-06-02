import { Router } from "express";
import healthRoutes from "./healthRoutes.js";
import authRoutes from "./authRoutes.js";
import openaiRoutes from "./openaiRoutes.js";
import chatRoutes from "./chatRoutes.js";

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(openaiRoutes);
router.use(chatRoutes);

export default router;

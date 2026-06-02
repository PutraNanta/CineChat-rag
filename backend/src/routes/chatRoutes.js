import { Router } from "express";
import {
  getLatestSessionHandler,
  getSessionById,
  getSessions,
  removeSession,
} from "../controllers/chatController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateOptional } from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticateOptional);

router.get("/chat/sessions/latest", asyncHandler(getLatestSessionHandler));
router.get("/chat/sessions", asyncHandler(getSessions));
router.get("/chat/sessions/:id", asyncHandler(getSessionById));
router.delete("/chat/sessions/:id", asyncHandler(removeSession));

export default router;

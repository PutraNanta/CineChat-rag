import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateMessageBody } from "../middlewares/validateMessageBody.js";
import { authenticateOptional } from "../middlewares/authenticate.js";
import { postDwh, postOltp, postRag } from "../controllers/openaiController.js";

const router = Router();

router.use(authenticateOptional);

router.post("/openai/rag", validateMessageBody, asyncHandler(postRag));
router.post("/openai/oltp", validateMessageBody, asyncHandler(postOltp));
router.post("/openai/dwh", validateMessageBody, asyncHandler(postDwh));

export default router;

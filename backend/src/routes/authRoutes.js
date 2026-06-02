import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateRequired } from "../middlewares/authenticate.js";
import { getMe, postLogin, postRegister } from "../controllers/authController.js";

const router = Router();

router.post("/auth/register", asyncHandler(postRegister));
router.post("/auth/login", asyncHandler(postLogin));
router.get("/auth/me", authenticateRequired, asyncHandler(getMe));

export default router;

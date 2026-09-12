import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { signupSchema, loginSchema } from "./auth.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// POST /api/auth/signup
router.post(
  "/signup",
  validate(signupSchema),
  asyncHandler((req, res) => authController.signup(req, res))
);

// POST /api/auth/login
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler((req, res) => authController.login(req, res))
);

export default router;

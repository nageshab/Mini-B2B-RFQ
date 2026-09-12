import { Router } from "express";
import { Role } from "@prisma/client";
import { quotationController } from "./quotation.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// All quotation routes require an authenticated user
router.use(authenticate);

// GET /api/quotations/mine — View supplier's own quotation history (SUPPLIER only)
router.get(
  "/mine",
  authorize(Role.SUPPLIER),
  asyncHandler((req, res) => quotationController.getMine(req, res))
);

export default router;

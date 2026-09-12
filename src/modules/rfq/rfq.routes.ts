import { Router } from "express";
import { Role } from "@prisma/client";
import { rfqController } from "./rfq.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate, validateQuery } from "../../middlewares/validate";
import {
  createRfqSchema,
  updateRfqSchema,
  rfqFilterQuerySchema,
} from "./rfq.schema";
import { quotationController } from "../quotation/quotation.controller";
import { createQuotationSchema } from "../quotation/quotation.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// All RFQ routes require an authenticated user
router.use(authenticate);

// ── Buyer Routes ─────────────────────────────────────────────────────────────

// POST /api/rfqs — Create new RFQ (BUYER only)
router.post(
  "/",
  authorize(Role.BUYER),
  validate(createRfqSchema),
  asyncHandler((req, res) => rfqController.create(req, res))
);

// GET /api/rfqs/mine — View buyer's own RFQs (BUYER only)
// Note: registered BEFORE /:id to prevent "mine" matching as an ID parameter
router.get(
  "/mine",
  authorize(Role.BUYER),
  asyncHandler((req, res) => rfqController.getMine(req, res))
);

// ── Supplier Routes ──────────────────────────────────────────────────────────

// GET /api/rfqs — Browse open, unexpired RFQs (SUPPLIER only)
router.get(
  "/",
  authorize(Role.SUPPLIER),
  validateQuery(rfqFilterQuerySchema),
  asyncHandler((req, res) => rfqController.getSupplierRfqs(req, res))
);

// ── Quotation Endpoints (Nested under /api/rfqs/:id/quotations) ──────────────

// POST /api/rfqs/:id/quotations — Submit quotation (SUPPLIER only)
router.post(
  "/:id/quotations",
  authorize(Role.SUPPLIER),
  validate(createQuotationSchema),
  asyncHandler((req, res) => quotationController.submit(req, res))
);

// GET /api/rfqs/:id/quotations — View quotations for an RFQ (Owning BUYER only)
router.get(
  "/:id/quotations",
  authorize(Role.BUYER),
  asyncHandler((req, res) => quotationController.getByRfq(req, res))
);

// ── Shared / Role-Specific Routes ────────────────────────────────────────────

// GET /api/rfqs/:id — View single RFQ details (BUYER own or SUPPLIER open)
router.get(
  "/:id",
  authorize(Role.BUYER, Role.SUPPLIER),
  asyncHandler((req, res) => rfqController.getById(req, res))
);

// PUT /api/rfqs/:id — Update or close own RFQ (BUYER only)
router.put(
  "/:id",
  authorize(Role.BUYER),
  validate(updateRfqSchema),
  asyncHandler((req, res) => rfqController.update(req, res))
);

export default router;

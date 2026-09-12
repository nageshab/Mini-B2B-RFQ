import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import rfqRoutes from "./modules/rfq/rfq.routes";
import quotationRoutes from "./modules/quotation/quotation.routes";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./docs/swagger";

const app = express();

// Set security-related HTTP response headers.
// Helmet is a collection of small middleware functions that set headers
// such as X-Content-Type-Options, X-Frame-Options, and Strict-Transport-Security.
app.use(helmet());

// Restrict cross-origin requests to the configured frontend origin only.
// This prevents other origins from calling our API in a browser context.
app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Parse incoming JSON request bodies and make them available on req.body.
app.use(express.json());

/**
 * GET /health
 *
 * Lightweight endpoint that confirms the server is running and reachable.
 * Intentionally kept at the application level — no router, controller, or
 * service needed for a simple ping response.
 */
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ── Application Routes ────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/rfqs", rfqRoutes);
app.use("/api/quotations", quotationRoutes);

// ── Swagger / OpenAPI Documentation ──────────────────────────────────────────
// Raw OpenAPI 3.0 specification in JSON format
app.get("/api-docs.json", (_req: Request, res: Response) => {
  res.status(200).json(openApiSpec);
});

// Interactive Swagger UI documentation
app.use(
  "/api-docs",
  (_req: Request, res: Response, next: NextFunction) => {
    res.removeHeader("Content-Security-Policy");
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
    customSiteTitle: "Mini B2B RFQ Marketplace - API Documentation",
  })
);

// ── Catch-all for unmatched routes ────────────────────────────────────────────
// Must come after all registered routes. Any request that falls through without
// a matching handler reaches notFound, which passes a 404 ApiError to next().
app.use(notFound);

// ── Global error handler ──────────────────────────────────────────────────────
// Must be the very last app.use() call. Express identifies error-handling
// middleware by its four-parameter signature (err, req, res, next).
// All ApiErrors, ZodErrors, Prisma errors, and unexpected errors are
// formatted into the standard response shape here.
app.use(errorHandler);

export default app;

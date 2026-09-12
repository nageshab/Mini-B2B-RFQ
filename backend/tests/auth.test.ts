import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import app from "../src/app";
import { prisma } from "../src/config/prisma";
import { env } from "../src/config/env";
import { authenticate } from "../src/middlewares/authenticate";
import { authorize } from "../src/middlewares/authorize";
import { errorHandler } from "../src/middlewares/errorHandler";

describe("Phase 4: Authentication and Authorization", () => {
  const timestamp = Date.now();
  const testBuyerEmail = `buyer_${timestamp}@example.com`;
  const testSupplierEmail = `supplier_${timestamp}@example.com`;
  const testPassword = "Password123!";

  let buyerToken: string;
  let supplierToken: string;

  // Test app to verify authenticate and authorize middleware routes in isolation
  const protectedTestApp = express();
  protectedTestApp.use(express.json());
  protectedTestApp.get(
    "/test/buyer-only",
    authenticate,
    authorize(Role.BUYER),
    (req, res) => {
      res.status(200).json({ success: true, user: req.user });
    }
  );
  protectedTestApp.get(
    "/test/supplier-only",
    authenticate,
    authorize(Role.SUPPLIER),
    (req, res) => {
      res.status(200).json({ success: true, user: req.user });
    }
  );
  protectedTestApp.get("/test/unexpected-error", () => {
    throw new Error("Simulated unexpected failure");
  });
  protectedTestApp.use(errorHandler);

  afterAll(async () => {
    // Clean up created test users from the database
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testBuyerEmail, testSupplierEmail],
        },
      },
    });
  });

  // ── 1. Existing Foundation & Health Check ─────────────────────────────────
  it("GET /health returns 200 and healthy status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.environment).toBe(env.NODE_ENV);
  });

  // ── 2. Existing 404 Handling ──────────────────────────────────────────────
  it("GET /api/nonexistent returns standardized 404 response", async () => {
    const res = await request(app).get("/api/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.statusCode).toBe(404);
    expect(res.body.message).toBe("Route not found");
  });

  // ── 3. Signup Validation ───────────────────────────────────────────────────
  it("POST /api/auth/signup fails when required fields are missing", async () => {
    const res = await request(app).post("/api/auth/signup").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation failed");
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it("POST /api/auth/signup fails with invalid email or short password", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "A",
      email: "invalid-email",
      password: "short",
      role: "INVALID_ROLE",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "name" }),
        expect.objectContaining({ path: "email" }),
        expect.objectContaining({ path: "password" }),
        expect.objectContaining({ path: "role" }),
      ])
    );
  });

  // ── 4. Successful Signup ───────────────────────────────────────────────────
  it("POST /api/auth/signup creates a BUYER user, returns safe data and JWT without password", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Test Buyer",
      email: testBuyerEmail.toUpperCase(), // Test email normalization to lowercase
      password: testPassword,
      role: Role.BUYER,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered successfully");
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.id).toBeDefined();
    expect(res.body.data.user.name).toBe("Test Buyer");
    expect(res.body.data.user.email).toBe(testBuyerEmail.toLowerCase());
    expect(res.body.data.user.role).toBe(Role.BUYER);
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.user.password).toBeUndefined();
    expect(typeof res.body.data.token).toBe("string");

    buyerToken = res.body.data.token;
  });

  it("POST /api/auth/signup creates a SUPPLIER user", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Test Supplier",
      email: testSupplierEmail,
      password: testPassword,
      role: Role.SUPPLIER,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe(Role.SUPPLIER);
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(typeof res.body.data.token).toBe("string");

    supplierToken = res.body.data.token;
  });

  // ── 5. Duplicate Signup Rejection ──────────────────────────────────────────
  it("POST /api/auth/signup rejects duplicate email with 409 Conflict", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Duplicate Buyer",
      email: testBuyerEmail,
      password: testPassword,
      role: Role.BUYER,
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  // ── 6. Login Validation & Authentication ──────────────────────────────────
  it("POST /api/auth/login fails when missing credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation failed");
  });

  it("POST /api/auth/login succeeds with valid credentials and normalized email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testBuyerEmail.toUpperCase(),
      password: testPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.statusCode).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.data.user.email).toBe(testBuyerEmail.toLowerCase());
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(typeof res.body.data.token).toBe("string");
  });

  it("POST /api/auth/login rejects non-existent email with generic 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nonexistent_user@example.com",
      password: "somepassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("POST /api/auth/login rejects wrong password with identical generic 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testBuyerEmail,
      password: "WrongPassword123!",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid email or password");
  });

  // ── 7. Authentication Middleware ──────────────────────────────────────────
  it("Protected route rejects request without Authorization header with 401", async () => {
    const res = await request(protectedTestApp).get("/test/buyer-only");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no token provided/i);
  });

  it("Protected route rejects malformed Authorization header with 401", async () => {
    const res = await request(protectedTestApp)
      .get("/test/buyer-only")
      .set("Authorization", "Basic invalidtoken");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("Protected route rejects invalid JWT signature with 401", async () => {
    const res = await request(protectedTestApp)
      .get("/test/buyer-only")
      .set("Authorization", "Bearer invalid.fake.token");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid or malformed token/i);
  });

  it("Protected route rejects expired JWT with 401", async () => {
    // Generate an intentionally expired token
    const expiredToken = jwt.sign(
      { sub: "some-user-id", role: Role.BUYER },
      env.JWT_SECRET,
      { expiresIn: "-1s" }
    );

    const res = await request(protectedTestApp)
      .get("/test/buyer-only")
      .set("Authorization", `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/expired/i);
  });

  // ── 8. Role Authorization Middleware ──────────────────────────────────────
  it("Buyer can access BUYER-authorized route", async () => {
    const res = await request(protectedTestApp)
      .get("/test/buyer-only")
      .set("Authorization", `Bearer ${buyerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe(Role.BUYER);
  });

  it("Supplier is forbidden from accessing BUYER-authorized route (403)", async () => {
    const res = await request(protectedTestApp)
      .get("/test/buyer-only")
      .set("Authorization", `Bearer ${supplierToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  it("Supplier can access SUPPLIER-authorized route", async () => {
    const res = await request(protectedTestApp)
      .get("/test/supplier-only")
      .set("Authorization", `Bearer ${supplierToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe(Role.SUPPLIER);
  });

  it("Buyer is forbidden from accessing SUPPLIER-authorized route (403)", async () => {
    const res = await request(protectedTestApp)
      .get("/test/supplier-only")
      .set("Authorization", `Bearer ${buyerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  // ── 9. Runtime Validation & Safe 500 Hardening ────────────────────────────
  it("Protected route rejects JWT with invalid role with 401", async () => {
    const invalidRoleToken = jwt.sign(
      { sub: "some-user-id", role: "ADMIN" },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = await request(protectedTestApp)
      .get("/test/buyer-only")
      .set("Authorization", `Bearer ${invalidRoleToken}`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("Protected route rejects JWT with non-string sub with 401", async () => {
    const invalidSubToken = jwt.sign(
      { sub: 12345, role: Role.BUYER },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = await request(protectedTestApp)
      .get("/test/buyer-only")
      .set("Authorization", `Bearer ${invalidSubToken}`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("Unexpected error returns generic 500 without leaking raw error message", async () => {
    const res = await request(protectedTestApp).get("/test/unexpected-error");
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.statusCode).toBe(500);
    expect(res.body.message).toBe("Internal server error");
    expect(res.body.errors).toEqual([]);
    expect(JSON.stringify(res.body)).not.toContain("Simulated unexpected failure");
  });
});

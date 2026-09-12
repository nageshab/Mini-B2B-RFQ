import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { Role, RfqStatus } from "@prisma/client";
import app from "../src/app";
import { prisma } from "../src/config/prisma";

describe("Phase 6: Quotation Module", () => {
  const timestamp = Date.now();
  const buyer1Email = `quote_buyer1_${timestamp}@example.com`;
  const buyer2Email = `quote_buyer2_${timestamp}@example.com`;
  const supplier1Email = `quote_supplier1_${timestamp}@example.com`;
  const supplier2Email = `quote_supplier2_${timestamp}@example.com`;
  const password = "Password123!";

  let buyer1Id: string;
  let buyer1Token: string;

  let buyer2Id: string;
  let buyer2Token: string;

  let supplier1Id: string;
  let supplier1Token: string;

  let supplier2Id: string;
  let supplier2Token: string;

  let openRfqId: string;
  let closedRfqId: string;
  let expiredRfqId: string;

  beforeAll(async () => {
    // 1. Create Buyer 1
    const b1Res = await request(app).post("/api/auth/signup").send({
      name: "Quote Buyer 1",
      email: buyer1Email,
      password,
      role: Role.BUYER,
    });
    buyer1Id = b1Res.body.data.user.id;
    buyer1Token = b1Res.body.data.token;

    // 2. Create Buyer 2
    const b2Res = await request(app).post("/api/auth/signup").send({
      name: "Quote Buyer 2",
      email: buyer2Email,
      password,
      role: Role.BUYER,
    });
    buyer2Id = b2Res.body.data.user.id;
    buyer2Token = b2Res.body.data.token;

    // 3. Create Supplier 1
    const s1Res = await request(app).post("/api/auth/signup").send({
      name: "Quote Supplier 1",
      email: supplier1Email,
      password,
      role: Role.SUPPLIER,
    });
    supplier1Id = s1Res.body.data.user.id;
    supplier1Token = s1Res.body.data.token;

    // 4. Create Supplier 2
    const s2Res = await request(app).post("/api/auth/signup").send({
      name: "Quote Supplier 2",
      email: supplier2Email,
      password,
      role: Role.SUPPLIER,
    });
    supplier2Id = s2Res.body.data.user.id;
    supplier2Token = s2Res.body.data.token;

    // 5. Create OPEN RFQ owned by Buyer 1
    const rfqRes = await request(app)
      .post("/api/rfqs")
      .set("Authorization", `Bearer ${buyer1Token}`)
      .send({
        productName: "Industrial Hydraulic Pumps",
        description: "Heavy duty 3000 PSI hydraulic gear pumps",
        quantity: 15,
        location: "Cleveland, OH",
        deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
      });
    openRfqId = rfqRes.body.data.id;

    // 6. Create CLOSED RFQ owned by Buyer 1
    const closedRes = await request(app)
      .post("/api/rfqs")
      .set("Authorization", `Bearer ${buyer1Token}`)
      .send({
        productName: "Closed Pumps",
        description: "RFQ that will be closed",
        quantity: 5,
        location: "Cleveland, OH",
        deadline: new Date(Date.now() + 86400000).toISOString(),
      });
    closedRfqId = closedRes.body.data.id;
    await request(app)
      .put(`/api/rfqs/${closedRfqId}`)
      .set("Authorization", `Bearer ${buyer1Token}`)
      .send({ status: RfqStatus.CLOSED });

    // 7. Create EXPIRED RFQ directly in DB
    const expiredRfq = await prisma.rfq.create({
      data: {
        buyerId: buyer1Id,
        productName: "Expired Pump Parts",
        description: "Past deadline",
        quantity: 2,
        location: "Cleveland, OH",
        deadline: new Date(Date.now() - 3600000), // 1 hour ago
        status: RfqStatus.OPEN,
      },
    });
    expiredRfqId = expiredRfq.id;
  });

  afterAll(async () => {
    // Clean up created records in reverse relation order
    await prisma.quotation.deleteMany({
      where: {
        supplierId: { in: [supplier1Id, supplier2Id] },
      },
    });
    await prisma.rfq.deleteMany({
      where: {
        buyerId: { in: [buyer1Id, buyer2Id] },
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [buyer1Id, buyer2Id, supplier1Id, supplier2Id] },
      },
    });
  });

  // ── 1. Authentication & Role Authorization on Quotation Endpoints ──────────
  it("Unauthenticated request to submit quotation is rejected with 401", async () => {
    const res = await request(app)
      .post(`/api/rfqs/${openRfqId}/quotations`)
      .send({ quotedPrice: 1250, estimatedDeliveryDays: 7 });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("Buyer cannot submit quotation (403)", async () => {
    const res = await request(app)
      .post(`/api/rfqs/${openRfqId}/quotations`)
      .set("Authorization", `Bearer ${buyer1Token}`)
      .send({ quotedPrice: 1250, estimatedDeliveryDays: 7 });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  it("Unauthenticated request to view RFQ quotations is rejected with 401", async () => {
    const res = await request(app).get(`/api/rfqs/${openRfqId}/quotations`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("Supplier cannot access buyer quotation endpoint GET /api/rfqs/:id/quotations (403)", async () => {
    const res = await request(app)
      .get(`/api/rfqs/${openRfqId}/quotations`)
      .set("Authorization", `Bearer ${supplier1Token}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  it("Unauthenticated request to GET /api/quotations/mine is rejected with 401", async () => {
    const res = await request(app).get("/api/quotations/mine");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("Buyer cannot access supplier GET /api/quotations/mine (403)", async () => {
    const res = await request(app)
      .get("/api/quotations/mine")
      .set("Authorization", `Bearer ${buyer1Token}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  // ── 2. Submission Validation ───────────────────────────────────────────────
  it("Supplier cannot submit quotation with missing required fields (400)", async () => {
    const res = await request(app)
      .post(`/api/rfqs/${openRfqId}/quotations`)
      .set("Authorization", `Bearer ${supplier1Token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation failed");
  });

  it("Supplier cannot submit quotation with non-positive quotedPrice (400)", async () => {
    const res = await request(app)
      .post(`/api/rfqs/${openRfqId}/quotations`)
      .set("Authorization", `Bearer ${supplier1Token}`)
      .send({
        quotedPrice: -500,
        estimatedDeliveryDays: 5,
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "quotedPrice" }),
      ])
    );
  });

  it("Supplier cannot submit quotation with non-integer or zero delivery days (400)", async () => {
    const res = await request(app)
      .post(`/api/rfqs/${openRfqId}/quotations`)
      .set("Authorization", `Bearer ${supplier1Token}`)
      .send({
        quotedPrice: 1500,
        estimatedDeliveryDays: 0,
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "estimatedDeliveryDays" }),
      ])
    );
  });

  it("Supplier cannot submit quotation using unsupported 'price' alias instead of 'quotedPrice' (400)", async () => {
    const res = await request(app)
      .post(`/api/rfqs/${openRfqId}/quotations`)
      .set("Authorization", `Bearer ${supplier1Token}`)
      .send({
        price: 1200,
        estimatedDeliveryDays: 5,
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation failed");
  });

  it("Supplier cannot submit quotation using unsupported 'notes' alias instead of 'message' (400)", async () => {
    const res = await request(app)
      .post(`/api/rfqs/${openRfqId}/quotations`)
      .set("Authorization", `Bearer ${supplier1Token}`)
      .send({
        quotedPrice: 1200,
        estimatedDeliveryDays: 5,
        notes: "Alias notes not allowed",
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation failed");
  });

  it("Supplier cannot submit quotation with unsupported extra/alias 'price' field alongside quotedPrice (400)", async () => {
    const res = await request(app)
      .post(`/api/rfqs/${openRfqId}/quotations`)
      .set("Authorization", `Bearer ${supplier1Token}`)
      .send({
        quotedPrice: 1200,
        price: 1200,
        estimatedDeliveryDays: 5,
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation failed");
  });

  // ── 3. Submission Target Availability Checks ───────────────────────────────
  it("Supplier cannot submit quotation to non-existent RFQ (404)", async () => {
    const res = await request(app)
      .post("/api/rfqs/00000000-0000-0000-0000-000000000000/quotations")
      .set("Authorization", `Bearer ${supplier1Token}`)
      .send({
        quotedPrice: 1200,
        estimatedDeliveryDays: 4,
      });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("RFQ not found");
  });

  it("Supplier cannot submit quotation to CLOSED RFQ (400)", async () => {
    const res = await request(app)
      .post(`/api/rfqs/${closedRfqId}/quotations`)
      .set("Authorization", `Bearer ${supplier1Token}`)
      .send({
        quotedPrice: 1200,
        estimatedDeliveryDays: 4,
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/closed/i);
  });

  it("Supplier cannot submit quotation to expired RFQ (400)", async () => {
    const res = await request(app)
      .post(`/api/rfqs/${expiredRfqId}/quotations`)
      .set("Authorization", `Bearer ${supplier1Token}`)
      .send({
        quotedPrice: 1200,
        estimatedDeliveryDays: 4,
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/expired/i);
  });

  // ── 4. Successful Quotation Submission & Data Correctness ──────────────────
  it("Supplier 1 successfully submits a quotation (201)", async () => {
    const res = await request(app)
      .post(`/api/rfqs/${openRfqId}/quotations`)
      .set("Authorization", `Bearer ${supplier1Token}`)
      .send({
        quotedPrice: 1450.75,
        estimatedDeliveryDays: 5,
        message: "Can ship within 5 business days with 2-year warranty",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.statusCode).toBe(201);
    expect(res.body.message).toBe("Quotation submitted successfully");

    const data = res.body.data;
    expect(data.id).toBeDefined();
    expect(data.rfqId).toBe(openRfqId);
    expect(data.supplierId).toBe(supplier1Id);
    expect(data.quotedPrice).toBe(1450.75);
    expect(data.price).toBe(1450.75);
    expect(data.estimatedDeliveryDays).toBe(5);
    expect(data.message).toBe(
      "Can ship within 5 business days with 2-year warranty"
    );
    expect(data.supplier).toBeDefined();
    expect(data.supplier.name).toBe("Quote Supplier 1");
    expect(data.supplier.passwordHash).toBeUndefined();
  });

  // ── 5. Duplicate Quotation Rejection ───────────────────────────────────────
  it("Supplier 1 cannot submit a second quotation for the same RFQ (409)", async () => {
    const res = await request(app)
      .post(`/api/rfqs/${openRfqId}/quotations`)
      .set("Authorization", `Bearer ${supplier1Token}`)
      .send({
        quotedPrice: 1300,
        estimatedDeliveryDays: 3,
        message: "Revised lower offer",
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already submitted/i);
  });

  it("Supplier 2 can submit a quotation for the same RFQ (201)", async () => {
    const res = await request(app)
      .post(`/api/rfqs/${openRfqId}/quotations`)
      .set("Authorization", `Bearer ${supplier2Token}`)
      .send({
        quotedPrice: 1600.0,
        estimatedDeliveryDays: 7,
        message: "Supplier 2 competitive quote",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.supplierId).toBe(supplier2Id);
    expect(res.body.data.quotedPrice).toBe(1600);
  });

  // ── 6. Buyer Views RFQ Quotations & Ownership Checks ───────────────────────
  it("Owning Buyer 1 can view all quotations received for their RFQ (200)", async () => {
    const res = await request(app)
      .get(`/api/rfqs/${openRfqId}/quotations`)
      .set("Authorization", `Bearer ${buyer1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);

    // Verify supplier details are present without sensitive fields
    const q1 = res.body.data.find((q: any) => q.supplierId === supplier1Id);
    expect(q1).toBeDefined();
    expect(q1.quotedPrice).toBe(1450.75);
    expect(q1.estimatedDeliveryDays).toBe(5);
    expect(q1.supplier).toBeDefined();
    expect(q1.supplier.name).toBe("Quote Supplier 1");
    expect(q1.supplier.email).toBe(supplier1Email);
    expect(q1.supplier.passwordHash).toBeUndefined();

    const q2 = res.body.data.find((q: any) => q.supplierId === supplier2Id);
    expect(q2).toBeDefined();
    expect(q2.quotedPrice).toBe(1600);
    expect(q2.supplier.name).toBe("Quote Supplier 2");
  });

  it("Another Buyer 2 cannot view quotations for Buyer 1's RFQ (403)", async () => {
    const res = await request(app)
      .get(`/api/rfqs/${openRfqId}/quotations`)
      .set("Authorization", `Bearer ${buyer2Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/permission|forbidden/i);
  });

  it("Buyer receives 404 when requesting quotations for non-existent RFQ", async () => {
    const res = await request(app)
      .get("/api/rfqs/00000000-0000-0000-0000-000000000000/quotations")
      .set("Authorization", `Bearer ${buyer1Token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("RFQ not found");
  });

  // ── 7. Supplier Quotation History & Isolation ──────────────────────────────
  it("Supplier 1 can view only their own submitted quotations with RFQ details (200)", async () => {
    const res = await request(app)
      .get("/api/quotations/mine")
      .set("Authorization", `Bearer ${supplier1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);

    const quote = res.body.data[0];
    expect(quote.supplierId).toBe(supplier1Id);
    expect(quote.quotedPrice).toBe(1450.75);
    expect(quote.estimatedDeliveryDays).toBe(5);

    // Verify RFQ details are included
    expect(quote.rfq).toBeDefined();
    expect(quote.rfq.id).toBe(openRfqId);
    expect(quote.rfq.productName).toBe("Industrial Hydraulic Pumps");
    expect(quote.rfq.quantity).toBe(15);
    expect(quote.rfq.status).toBe(RfqStatus.OPEN);
  });

  it("Supplier 2 can view only their own submitted quotations and cannot see Supplier 1's (200)", async () => {
    const res = await request(app)
      .get("/api/quotations/mine")
      .set("Authorization", `Bearer ${supplier2Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);

    const quote = res.body.data[0];
    expect(quote.supplierId).toBe(supplier2Id);
    expect(quote.quotedPrice).toBe(1600);
    expect(quote.supplierId).not.toBe(supplier1Id);
  });
});

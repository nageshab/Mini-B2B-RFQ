import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { Role, RfqStatus } from "@prisma/client";
import app from "../src/app";
import { prisma } from "../src/config/prisma";
import { generateToken } from "../src/utils/jwt";

describe("Phase 5: RFQ Module", () => {
  const timestamp = Date.now();
  const buyer1Email = `rfq_buyer1_${timestamp}@example.com`;
  const buyer2Email = `rfq_buyer2_${timestamp}@example.com`;
  const supplierEmail = `rfq_supplier_${timestamp}@example.com`;
  const password = "Password123!";

  let buyer1Id: string;
  let buyer1Token: string;

  let buyer2Id: string;
  let buyer2Token: string;

  let supplierId: string;
  let supplierToken: string;

  let activeRfqId: string;
  let closedRfqId: string;
  let expiredRfqId: string;

  beforeAll(async () => {
    // Create Buyer 1
    const buyer1Res = await request(app).post("/api/auth/signup").send({
      name: "RFQ Buyer 1",
      email: buyer1Email,
      password,
      role: Role.BUYER,
    });
    buyer1Id = buyer1Res.body.data.user.id;
    buyer1Token = buyer1Res.body.data.token;

    // Create Buyer 2
    const buyer2Res = await request(app).post("/api/auth/signup").send({
      name: "RFQ Buyer 2",
      email: buyer2Email,
      password,
      role: Role.BUYER,
    });
    buyer2Id = buyer2Res.body.data.user.id;
    buyer2Token = buyer2Res.body.data.token;

    // Create Supplier
    const supplierRes = await request(app).post("/api/auth/signup").send({
      name: "RFQ Supplier",
      email: supplierEmail,
      password,
      role: Role.SUPPLIER,
    });
    supplierId = supplierRes.body.data.user.id;
    supplierToken = supplierRes.body.data.token;
  });

  afterAll(async () => {
    // Clean up created RFQs and users
    await prisma.rfq.deleteMany({
      where: {
        buyerId: { in: [buyer1Id, buyer2Id] },
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [buyer1Id, buyer2Id, supplierId] },
      },
    });
  });

  // ── 1. Authentication & Role Authorization on RFQ Routes ───────────────────
  it("Unauthenticated request to /api/rfqs is rejected with 401", async () => {
    const res = await request(app).get("/api/rfqs");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("Buyer cannot access supplier marketplace GET /api/rfqs (403)", async () => {
    const res = await request(app)
      .get("/api/rfqs")
      .set("Authorization", `Bearer ${buyer1Token}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  it("Supplier cannot create RFQ POST /api/rfqs (403)", async () => {
    const res = await request(app)
      .post("/api/rfqs")
      .set("Authorization", `Bearer ${supplierToken}`)
      .send({
        productName: "Test",
        description: "Test Desc",
        quantity: 10,
        location: "NY",
        deadline: new Date(Date.now() + 86400000).toISOString(),
      });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("Supplier cannot access GET /api/rfqs/mine (403)", async () => {
    const res = await request(app)
      .get("/api/rfqs/mine")
      .set("Authorization", `Bearer ${supplierToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // ── 2. RFQ Creation Validation ─────────────────────────────────────────────
  it("Buyer cannot create RFQ with missing required fields (400)", async () => {
    const res = await request(app)
      .post("/api/rfqs")
      .set("Authorization", `Bearer ${buyer1Token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation failed");
  });

  it("Buyer cannot create RFQ with negative or non-integer quantity (400)", async () => {
    const res = await request(app)
      .post("/api/rfqs")
      .set("Authorization", `Bearer ${buyer1Token}`)
      .send({
        productName: "Steel Beams",
        description: "Industrial grade steel beams",
        quantity: -5,
        location: "Chicago, IL",
        deadline: new Date(Date.now() + 86400000).toISOString(),
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "quantity" }),
      ])
    );
  });

  it("Buyer cannot create RFQ with past deadline (400)", async () => {
    const pastDate = new Date(Date.now() - 3600000).toISOString();
    const res = await request(app)
      .post("/api/rfqs")
      .set("Authorization", `Bearer ${buyer1Token}`)
      .send({
        productName: "Steel Beams",
        description: "Industrial grade steel beams",
        quantity: 50,
        location: "Chicago, IL",
        deadline: pastDate,
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "deadline",
          message: "Deadline must be a future date",
        }),
      ])
    );
  });

  // ── 3. Successful RFQ Creation ─────────────────────────────────────────────
  it("Buyer successfully creates an RFQ (201)", async () => {
    const futureDate = new Date(Date.now() + 7 * 86400000).toISOString();
    const res = await request(app)
      .post("/api/rfqs")
      .set("Authorization", `Bearer ${buyer1Token}`)
      .send({
        productName: "Industrial Aluminum Sheets",
        description: "Standard grade 6061 aluminum alloy sheets",
        quantity: 500,
        location: "Dallas, TX",
        deadline: futureDate,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.statusCode).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.productName).toBe("Industrial Aluminum Sheets");
    expect(res.body.data.quantity).toBe(500);
    expect(res.body.data.location).toBe("Dallas, TX");
    expect(res.body.data.status).toBe(RfqStatus.OPEN);
    expect(res.body.data.buyerId).toBe(buyer1Id);

    activeRfqId = res.body.data.id;
  });

  // ── 4. Buyer Retrieves Own RFQs ────────────────────────────────────────────
  it("Buyer can view their own RFQs with quotation counts (200)", async () => {
    const res = await request(app)
      .get("/api/rfqs/mine")
      .set("Authorization", `Bearer ${buyer1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const found = res.body.data.find((r: any) => r.id === activeRfqId);
    expect(found).toBeDefined();
    expect(found._count).toBeDefined();
    expect(typeof found._count.quotations).toBe("number");
  });

  // ── 5. Buyer Updates Own RFQ & Ownership Checks ────────────────────────────
  it("Buyer can update their own OPEN RFQ content (200)", async () => {
    const res = await request(app)
      .put(`/api/rfqs/${activeRfqId}`)
      .set("Authorization", `Bearer ${buyer1Token}`)
      .send({
        quantity: 600,
        description: "Updated description: need 600 units instead of 500",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.quantity).toBe(600);
    expect(res.body.data.description).toBe(
      "Updated description: need 600 units instead of 500"
    );
  });

  it("Another buyer cannot update Buyer 1's RFQ (403)", async () => {
    const res = await request(app)
      .put(`/api/rfqs/${activeRfqId}`)
      .set("Authorization", `Bearer ${buyer2Token}`)
      .send({ quantity: 1000 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  it("Another buyer cannot view Buyer 1's RFQ details via GET /api/rfqs/:id (403)", async () => {
    const res = await request(app)
      .get(`/api/rfqs/${activeRfqId}`)
      .set("Authorization", `Bearer ${buyer2Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  it("Buyer can view their own RFQ details via GET /api/rfqs/:id (200)", async () => {
    const res = await request(app)
      .get(`/api/rfqs/${activeRfqId}`)
      .set("Authorization", `Bearer ${buyer1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(activeRfqId);
    expect(res.body.data.productName).toBe("Industrial Aluminum Sheets");
  });

  // ── 6. RFQ Status Lifecycle (OPEN -> CLOSED) & Immutability ────────────────
  it("Buyer can close their own RFQ (200)", async () => {
    // First create a second RFQ to close
    const createRes = await request(app)
      .post("/api/rfqs")
      .set("Authorization", `Bearer ${buyer1Token}`)
      .send({
        productName: "Copper Pipes to Close",
        description: "Pipes that will be closed soon",
        quantity: 200,
        location: "Houston, TX",
        deadline: new Date(Date.now() + 86400000).toISOString(),
      });
    closedRfqId = createRes.body.data.id;

    // Close the RFQ
    const closeRes = await request(app)
      .put(`/api/rfqs/${closedRfqId}`)
      .set("Authorization", `Bearer ${buyer1Token}`)
      .send({ status: RfqStatus.CLOSED });

    expect(closeRes.status).toBe(200);
    expect(closeRes.body.success).toBe(true);
    expect(closeRes.body.data.status).toBe(RfqStatus.CLOSED);
  });

  it("Buyer cannot reopen a CLOSED RFQ (400)", async () => {
    const res = await request(app)
      .put(`/api/rfqs/${closedRfqId}`)
      .set("Authorization", `Bearer ${buyer1Token}`)
      .send({ status: RfqStatus.OPEN });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Cannot reopen a closed RFQ");
  });

  it("Buyer cannot modify content fields of a CLOSED RFQ (400)", async () => {
    const res = await request(app)
      .put(`/api/rfqs/${closedRfqId}`)
      .set("Authorization", `Bearer ${buyer1Token}`)
      .send({ quantity: 999 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Cannot modify a closed RFQ");
  });

  // ── 7. Supplier Marketplace Access & Filters ───────────────────────────────
  it("Supplier can browse available OPEN RFQs (200)", async () => {
    const res = await request(app)
      .get("/api/rfqs")
      .set("Authorization", `Bearer ${supplierToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rfqs).toBeDefined();
    expect(res.body.data.pagination).toBeDefined();

    // Active RFQ must be present
    const foundActive = res.body.data.rfqs.find(
      (r: any) => r.id === activeRfqId
    );
    expect(foundActive).toBeDefined();

    // Closed RFQ must NOT be present
    const foundClosed = res.body.data.rfqs.find(
      (r: any) => r.id === closedRfqId
    );
    expect(foundClosed).toBeUndefined();
  });

  it("Supplier browse search filter works correctly", async () => {
    const res = await request(app)
      .get("/api/rfqs?search=Aluminum")
      .set("Authorization", `Bearer ${supplierToken}`);

    expect(res.status).toBe(200);
    expect(
      res.body.data.rfqs.every(
        (r: any) =>
          r.productName.toLowerCase().includes("aluminum") ||
          r.description.toLowerCase().includes("aluminum")
      )
    ).toBe(true);
  });

  it("Supplier browse location filter works correctly", async () => {
    const res = await request(app)
      .get("/api/rfqs?location=Dallas")
      .set("Authorization", `Bearer ${supplierToken}`);

    expect(res.status).toBe(200);
    expect(
      res.body.data.rfqs.every((r: any) =>
        r.location.toLowerCase().includes("dallas")
      )
    ).toBe(true);
  });

  it("Supplier browse pagination works and properly coerces page and limit", async () => {
    const res = await request(app)
      .get("/api/rfqs?page=1&limit=5")
      .set("Authorization", `Bearer ${supplierToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pagination.page).toBe(1);
    expect(typeof res.body.data.pagination.page).toBe("number");
    expect(res.body.data.pagination.limit).toBe(5);
    expect(typeof res.body.data.pagination.limit).toBe("number");
    expect(typeof res.body.data.pagination.total).toBe("number");
    expect(typeof res.body.data.pagination.totalPages).toBe("number");
    expect(res.body.data.rfqs.length).toBeLessThanOrEqual(5);
  });

  it("Supplier can view details of an OPEN, non-expired RFQ (200)", async () => {
    const res = await request(app)
      .get(`/api/rfqs/${activeRfqId}`)
      .set("Authorization", `Bearer ${supplierToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(activeRfqId);
    expect(res.body.data.buyer).toBeDefined();
    expect(res.body.data.buyer.name).toBe("RFQ Buyer 1");
  });

  it("Supplier is forbidden from viewing details of a CLOSED RFQ (403)", async () => {
    const res = await request(app)
      .get(`/api/rfqs/${closedRfqId}`)
      .set("Authorization", `Bearer ${supplierToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/closed or expired/i);
  });

  // ── 8. Expired RFQ Handling ────────────────────────────────────────────────
  it("Supplier is forbidden from viewing details of an expired RFQ (403)", async () => {
    // Manually create an expired RFQ directly in the DB to simulate deadline passing
    const expiredRfq = await prisma.rfq.create({
      data: {
        buyerId: buyer1Id,
        productName: "Expired Raw Materials",
        description: "This item has already expired",
        quantity: 100,
        location: "Denver, CO",
        deadline: new Date(Date.now() - 3600000), // 1 hour ago
        status: RfqStatus.OPEN,
      },
    });
    expiredRfqId = expiredRfq.id;

    // Supplier browse should NOT include expired RFQ
    const browseRes = await request(app)
      .get("/api/rfqs")
      .set("Authorization", `Bearer ${supplierToken}`);
    const foundInBrowse = browseRes.body.data.rfqs.find(
      (r: any) => r.id === expiredRfqId
    );
    expect(foundInBrowse).toBeUndefined();

    // Direct access by supplier should return 403
    const directRes = await request(app)
      .get(`/api/rfqs/${expiredRfqId}`)
      .set("Authorization", `Bearer ${supplierToken}`);

    expect(directRes.status).toBe(403);
    expect(directRes.body.success).toBe(false);
    expect(directRes.body.message).toMatch(/closed or expired/i);
  });

  it("Request for non-existent RFQ ID returns 404", async () => {
    const res = await request(app)
      .get("/api/rfqs/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${buyer1Token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("RFQ not found");
  });
});

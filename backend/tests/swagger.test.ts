import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";
import { openApiSpec } from "../src/docs/swagger";

describe("Phase 7: Swagger / OpenAPI Documentation", () => {
  it("GET /api-docs/ returns 200 OK and serves Swagger UI HTML", async () => {
    const res = await request(app).get("/api-docs/");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/html/);
    expect(res.text).toContain("swagger-ui");
  });

  it("GET /api-docs redirects to /api-docs/ with trailing slash (301)", async () => {
    const res = await request(app).get("/api-docs");
    // Express static router redirects directory path to trailing slash
    expect([200, 301]).toContain(res.status);
    if (res.status === 301) {
      expect(res.headers.location).toMatch(/\/api-docs\//);
    }
  });

  it("GET /api-docs.json returns valid OpenAPI 3.0 specification", async () => {
    const res = await request(app).get("/api-docs.json");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.info.title).toBe("Mini B2B RFQ Marketplace API");
    expect(res.body.servers[0].url).toBe("http://localhost:3000");
  });

  it("OpenAPI specification defines local development server at http://localhost:3000", () => {
    expect(openApiSpec.servers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "http://localhost:3000",
        }),
      ])
    );
  });

  it("OpenAPI specification contains all required paths", () => {
    const paths = Object.keys(openApiSpec.paths);

    const requiredPaths = [
      "/health",
      "/api/auth/signup",
      "/api/auth/login",
      "/api/rfqs",
      "/api/rfqs/mine",
      "/api/rfqs/{id}",
      "/api/rfqs/{id}/quotations",
      "/api/quotations/mine",
    ];

    for (const path of requiredPaths) {
      expect(paths).toContain(path);
    }
  });

  it("OpenAPI specification contains bearerAuth security scheme", () => {
    const securitySchemes = openApiSpec.components.securitySchemes;
    expect(securitySchemes).toBeDefined();
    expect(securitySchemes.bearerAuth).toBeDefined();
    expect(securitySchemes.bearerAuth.type).toBe("http");
    expect(securitySchemes.bearerAuth.scheme).toBe("bearer");
    expect(securitySchemes.bearerAuth.bearerFormat).toBe("JWT");
  });

  it("Protected endpoints require bearerAuth security", () => {
    // Check that protected endpoints define security with bearerAuth
    expect(openApiSpec.paths["/api/rfqs"].post.security).toEqual(
      expect.arrayContaining([{ bearerAuth: [] }])
    );
    expect(openApiSpec.paths["/api/rfqs"].get.security).toEqual(
      expect.arrayContaining([{ bearerAuth: [] }])
    );
    expect(openApiSpec.paths["/api/rfqs/mine"].get.security).toEqual(
      expect.arrayContaining([{ bearerAuth: [] }])
    );
    expect(openApiSpec.paths["/api/rfqs/{id}"].get.security).toEqual(
      expect.arrayContaining([{ bearerAuth: [] }])
    );
    expect(openApiSpec.paths["/api/rfqs/{id}"].put.security).toEqual(
      expect.arrayContaining([{ bearerAuth: [] }])
    );
    expect(openApiSpec.paths["/api/rfqs/{id}/quotations"].post.security).toEqual(
      expect.arrayContaining([{ bearerAuth: [] }])
    );
    expect(openApiSpec.paths["/api/rfqs/{id}/quotations"].get.security).toEqual(
      expect.arrayContaining([{ bearerAuth: [] }])
    );
    expect(openApiSpec.paths["/api/quotations/mine"].get.security).toEqual(
      expect.arrayContaining([{ bearerAuth: [] }])
    );

    // Public endpoints do not require bearerAuth
    expect(openApiSpec.paths["/health"].get.security).toBeUndefined();
    expect(openApiSpec.paths["/api/auth/signup"].post.security).toBeUndefined();
    expect(openApiSpec.paths["/api/auth/login"].post.security).toBeUndefined();
  });
});

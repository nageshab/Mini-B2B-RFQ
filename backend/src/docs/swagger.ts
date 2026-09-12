/**
 * OpenAPI 3.0 Specification and Swagger UI Configuration
 *
 * Accurately documents all implemented REST API endpoints for Mini B2B RFQ Marketplace:
 * - Health check
 * - Authentication (Signup, Login)
 * - RFQs (Create, Browse marketplace, Buyer's list, Single RFQ, Update/Close)
 * - Quotations (Submit quotation, View RFQ quotations, Supplier's history)
 */

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Mini B2B RFQ Marketplace API",
    version: "1.0.0",
    description:
      "Production-ready REST API for the Mini B2B RFQ Marketplace platform.\n\n" +
      "### Authentication\n" +
      "Protected endpoints require a valid JWT Bearer token in the `Authorization` header:\n" +
      "```http\nAuthorization: Bearer <your_jwt_token>\n```\n\n" +
      "### Roles & Access Control\n" +
      "- **BUYER**: Can create RFQs, view and update own RFQs, and inspect received quotations.\n" +
      "- **SUPPLIER**: Can browse active/unexpired marketplace RFQs, submit quotations, and view quotation history.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Development Server",
    },
  ],
  tags: [
    {
      name: "Health",
      description: "Server health and diagnostic endpoints",
    },
    {
      name: "Authentication",
      description: "User registration and credential verification (JWT issuance)",
    },
    {
      name: "RFQs",
      description: "Request for Quotation management for buyers and suppliers",
    },
    {
      name: "Quotations",
      description: "Supplier quotation submissions and buyer quotation reviews",
    },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description:
          "Health check to confirm that the server is running and responsive.",
        responses: {
          "200": {
            description: "Server is healthy and running",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HealthResponse",
                },
                example: {
                  status: "ok",
                  timestamp: "2026-09-12T12:00:00.000Z",
                  environment: "development",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/signup": {
      post: {
        tags: ["Authentication"],
        summary: "Create an account",
        description:
          "Register a new user account with role BUYER or SUPPLIER. Returns the user profile and a signed JWT access token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SignupRequest",
              },
              example: {
                name: "Acme Industrial Corp",
                email: "procurement@acmeindustrial.com",
                password: "SecurePassword123!",
                role: "BUYER",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User created and authenticated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthSuccessResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid request data or business rule violation",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
              },
            },
          },
          "409": {
            description: "The request conflicts with existing data, such as a duplicate email",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  statusCode: 409,
                  message: "User with this email already exists",
                  errors: [],
                },
              },
            },
          },
          "500": {
            description: "An unexpected server error occurred",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Sign in",
        description:
          "Authenticate with email and password. Returns user details and a signed JWT access token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
              example: {
                email: "procurement@acmeindustrial.com",
                password: "SecurePassword123!",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Authentication successful",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthSuccessResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failure (e.g. invalid email format)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
              },
            },
          },
          "401": {
            description: "Invalid email or password",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  statusCode: 401,
                  message: "Invalid email or password",
                  errors: [],
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/rfqs": {
      post: {
        tags: ["RFQs"],
        summary: "Create an RFQ",
        description:
          "Create a new Request for Quotation as a buyer. Only users with the BUYER role can create RFQs. Requires a positive quantity and a future deadline. Newly created RFQs start in OPEN status.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateRfqRequest",
              },
              example: {
                productName: "Titanium CNC Components",
                description: "Need precision-machined titanium components according to supplied drawings.",
                quantity: 500,
                location: "Seattle",
                deadline: "2026-11-30T18:00:00.000Z",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "RFQ created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RfqDetailResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid request data or business rule violation",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
              },
            },
          },
          "401": {
            description: "Authentication is required or the access token is invalid",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "403": {
            description: "The authenticated user does not have permission to perform this action",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "An unexpected server error occurred",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
      get: {
        tags: ["RFQs"],
        summary: "Browse open RFQs",
        description:
          "Browse currently available RFQs as a supplier. Only open, non-expired RFQs are returned. Supports keyword search, location filtering, and pagination.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "search",
            in: "query",
            required: false,
            description: "Optional keyword search across available RFQs.",
            schema: {
              type: "string",
            },
            example: "Titanium",
          },
          {
            name: "location",
            in: "query",
            required: false,
            description: "Optional delivery-location filter.",
            schema: {
              type: "string",
            },
            example: "Seattle",
          },
          {
            name: "page",
            in: "query",
            required: false,
            description: "Page number, starting at 1.",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
            },
            example: 1,
          },
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Number of RFQs returned per page.",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 20,
            },
            example: 20,
          },
        ],
        responses: {
          "200": {
            description: "List of open RFQs matching filter criteria with pagination metadata",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SupplierRfqListResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid request data or business rule violation",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
              },
            },
          },
          "401": {
            description: "Authentication is required or the access token is invalid",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "403": {
            description: "The authenticated user does not have permission to perform this action",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "An unexpected server error occurred",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/rfqs/mine": {
      get: {
        tags: ["RFQs"],
        summary: "List my RFQs",
        description:
          "Retrieve all RFQs created by the authenticated buyer, ordered by newest first. Includes quotation counts.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of buyer's RFQs with quotation counts",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/BuyerRfqListResponse",
                },
              },
            },
          },
          "401": {
            description: "The request lacks valid authentication credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "403": {
            description: "The authenticated user does not have permission to perform this action",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "An unexpected server error occurred",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/rfqs/{id}": {
      get: {
        tags: ["RFQs"],
        summary: "Get RFQ details",
        description:
          "Retrieve details for a single RFQ. Buyers can view their own RFQs. Suppliers can view any open, non-expired RFQ.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "UUID of the RFQ.",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          },
        ],
        responses: {
          "200": {
            description: "RFQ details retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RfqDetailResponse",
                },
              },
            },
          },
          "401": {
            description: "The request lacks valid authentication credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "403": {
            description: "The authenticated user does not have permission to perform this action",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  statusCode: 403,
                  message: "Forbidden: You do not own this RFQ",
                  errors: [],
                },
              },
            },
          },
          "404": {
            description: "The requested resource was not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  statusCode: 404,
                  message: "RFQ not found",
                  errors: [],
                },
              },
            },
          },
          "500": {
            description: "An unexpected server error occurred",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["RFQs"],
        summary: "Update an RFQ",
        description:
          "Update specifications or close an RFQ. Only the owning buyer can update their RFQ. Open RFQs can be modified or closed. Closed RFQs cannot be reopened or modified.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "UUID of the RFQ to update.",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateRfqRequest",
              },
              example: {
                quantity: 600,
                description: "Updated tolerance specifications for precision machining.",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "RFQ updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RfqDetailResponse",
                },
              },
            },
          },
          "400": {
            description: "The request payload is invalid or violates business rules",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  statusCode: 400,
                  message: "Cannot modify a closed RFQ",
                  errors: [],
                },
              },
            },
          },
          "401": {
            description: "The request lacks valid authentication credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "403": {
            description: "The authenticated user does not have permission to perform this action",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  statusCode: 403,
                  message: "Forbidden: You do not own this RFQ",
                  errors: [],
                },
              },
            },
          },
          "404": {
            description: "The requested resource was not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "An unexpected server error occurred",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/rfqs/{id}/quotations": {
      post: {
        tags: ["Quotations"],
        summary: "Submit a quotation",
        description:
          "Submit a quotation for an open RFQ as a supplier. The RFQ must be open and not expired. Each supplier can submit only one quotation per RFQ.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "UUID of the RFQ being quoted on.",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateQuotationRequest",
              },
              example: {
                quotedPrice: 45000,
                estimatedDeliveryDays: 14,
                message: "Includes production inspection and material certification.",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Quotation submitted successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/QuotationDetailResponse",
                },
              },
            },
          },
          "400": {
            description: "The request payload is invalid or violates business rules",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  statusCode: 400,
                  message: "Cannot submit quotation for a closed RFQ",
                  errors: [],
                },
              },
            },
          },
          "401": {
            description: "The request lacks valid authentication credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "403": {
            description: "The authenticated user does not have permission to perform this action",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "404": {
            description: "The requested resource was not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "409": {
            description: "A quotation has already been submitted by this supplier for this RFQ",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  statusCode: 409,
                  message: "Quotation already submitted for this RFQ",
                  errors: [],
                },
              },
            },
          },
          "500": {
            description: "An unexpected server error occurred",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
      get: {
        tags: ["Quotations"],
        summary: "View received quotations",
        description:
          "View all quotations submitted for an RFQ. Only accessible by the buyer who owns the RFQ.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "UUID of the RFQ.",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          },
        ],
        responses: {
          "200": {
            description: "Quotations retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RfqQuotationsListResponse",
                },
              },
            },
          },
          "401": {
            description: "The request lacks valid authentication credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "403": {
            description: "The authenticated user does not have permission to perform this action",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  statusCode: 403,
                  message: "Forbidden: You do not have permission to view quotations for this RFQ",
                  errors: [],
                },
              },
            },
          },
          "404": {
            description: "The requested resource was not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "An unexpected server error occurred",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/quotations/mine": {
      get: {
        tags: ["Quotations"],
        summary: "List my quotations",
        description:
          "Retrieve all quotations previously submitted by the authenticated supplier, ordered by newest first.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Quotations retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SupplierQuotationsListResponse",
                },
              },
            },
          },
          "401": {
            description: "The request lacks valid authentication credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "403": {
            description: "The authenticated user does not have permission to perform this action",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "An unexpected server error occurred",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token obtained from `/api/auth/signup` or `/api/auth/login`.",
      },
    },
    schemas: {
      // ── Standard Envelope Schemas ───────────────────────────────────────────
      ErrorResponse: {
        type: "object",
        required: ["success", "statusCode", "message", "errors"],
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          statusCode: {
            type: "integer",
            example: 400,
          },
          message: {
            type: "string",
            example: "Error message describing the failure",
          },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string", example: "fieldName" },
                message: { type: "string", example: "Detailed issue" },
              },
            },
            example: [],
          },
        },
      },
      ValidationErrorResponse: {
        type: "object",
        required: ["success", "statusCode", "message", "errors"],
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          statusCode: {
            type: "integer",
            example: 400,
          },
          message: {
            type: "string",
            example: "Validation failed",
          },
          errors: {
            type: "array",
            items: {
              type: "object",
              required: ["path", "message"],
              properties: {
                path: {
                  type: "string",
                  example: "quotedPrice",
                },
                message: {
                  type: "string",
                  example: "Quoted price is required and must be a number",
                },
              },
            },
            example: [
              {
                path: "quotedPrice",
                message: "Quoted price is required and must be a number",
              },
            ],
          },
        },
      },
      HealthResponse: {
        type: "object",
        required: ["status", "timestamp", "environment"],
        properties: {
          status: {
            type: "string",
            example: "ok",
          },
          timestamp: {
            type: "string",
            format: "date-time",
            example: "2026-09-12T12:00:00.000Z",
          },
          environment: {
            type: "string",
            example: "development",
          },
        },
      },

      // ── User & Auth Schemas ────────────────────────────────────────────────
      SafeUser: {
        type: "object",
        required: ["id", "name", "email", "role", "createdAt", "updatedAt"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "c1f72d42-4911-424a-95ee-d079450be850",
          },
          name: {
            type: "string",
            example: "Acme Buyer",
          },
          email: {
            type: "string",
            format: "email",
            example: "buyer@acme.com",
          },
          role: {
            type: "string",
            enum: ["BUYER", "SUPPLIER"],
            example: "BUYER",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-09-12T12:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2026-09-12T12:00:00.000Z",
          },
        },
      },
      SignupRequest: {
        type: "object",
        required: ["name", "email", "password", "role"],
        properties: {
          name: {
            type: "string",
            minLength: 2,
            example: "Acme Buyer Corp",
          },
          email: {
            type: "string",
            format: "email",
            example: "procurement@acme.com",
          },
          password: {
            type: "string",
            minLength: 8,
            example: "SecurePassword123!",
          },
          role: {
            type: "string",
            enum: ["BUYER", "SUPPLIER"],
            example: "BUYER",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "procurement@acme.com",
          },
          password: {
            type: "string",
            minLength: 1,
            example: "SecurePassword123!",
          },
        },
      },
      AuthSuccessResponse: {
        type: "object",
        required: ["success", "statusCode", "message", "data"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          statusCode: {
            type: "integer",
            example: 200,
          },
          message: {
            type: "string",
            example: "Login successful",
          },
          data: {
            type: "object",
            required: ["user", "token"],
            properties: {
              user: {
                $ref: "#/components/schemas/SafeUser",
              },
              token: {
                type: "string",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              },
            },
          },
        },
      },

      // ── RFQ Schemas ────────────────────────────────────────────────────────
      CreateRfqRequest: {
        type: "object",
        required: ["productName", "description", "quantity", "location", "deadline"],
        properties: {
          productName: {
            type: "string",
            minLength: 2,
            example: "CNC Machined Aluminum Housings",
          },
          description: {
            type: "string",
            minLength: 5,
            example: "Grade 6061-T6 anodized enclosure components machined to ISO 2768-m tolerances.",
          },
          quantity: {
            type: "integer",
            minimum: 1,
            example: 200,
          },
          location: {
            type: "string",
            minLength: 2,
            example: "Chicago, IL",
          },
          deadline: {
            type: "string",
            format: "date-time",
            description: "Future ISO date-time string by which quotes must be received.",
            example: "2026-12-15T23:59:59.000Z",
          },
        },
      },
      UpdateRfqRequest: {
        type: "object",
        description: "Partial RFQ update. At least one field required. CLOSED RFQs cannot be reopened or edited.",
        properties: {
          productName: {
            type: "string",
            minLength: 2,
            example: "CNC Machined Aluminum Housings v2",
          },
          description: {
            type: "string",
            minLength: 5,
            example: "Updated tolerance specifications to ISO 2768-f.",
          },
          quantity: {
            type: "integer",
            minimum: 1,
            example: 300,
          },
          location: {
            type: "string",
            minLength: 2,
            example: "Chicago, IL",
          },
          deadline: {
            type: "string",
            format: "date-time",
            example: "2026-12-20T23:59:59.000Z",
          },
          status: {
            type: "string",
            enum: ["OPEN", "CLOSED"],
            description: "Allowed transition: OPEN -> CLOSED. Transition CLOSED -> OPEN is strictly prohibited.",
            example: "CLOSED",
          },
        },
      },
      RfqItem: {
        type: "object",
        required: [
          "id",
          "buyerId",
          "productName",
          "description",
          "quantity",
          "location",
          "deadline",
          "status",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          },
          buyerId: {
            type: "string",
            format: "uuid",
            example: "c1f72d42-4911-424a-95ee-d079450be850",
          },
          productName: {
            type: "string",
            example: "CNC Machined Aluminum Housings",
          },
          description: {
            type: "string",
            example: "Grade 6061-T6 anodized enclosure components machined to ISO 2768-m tolerances.",
          },
          quantity: {
            type: "integer",
            example: 200,
          },
          location: {
            type: "string",
            example: "Chicago, IL",
          },
          deadline: {
            type: "string",
            format: "date-time",
            example: "2026-12-15T23:59:59.000Z",
          },
          status: {
            type: "string",
            enum: ["OPEN", "CLOSED"],
            example: "OPEN",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-09-12T12:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2026-09-12T12:00:00.000Z",
          },
          buyer: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
          _count: {
            type: "object",
            properties: {
              quotations: { type: "integer", example: 3 },
            },
          },
        },
      },
      RfqDetailResponse: {
        type: "object",
        required: ["success", "statusCode", "message", "data"],
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          message: { type: "string", example: "Fetched RFQ details" },
          data: { $ref: "#/components/schemas/RfqItem" },
        },
      },
      BuyerRfqListResponse: {
        type: "object",
        required: ["success", "statusCode", "message", "data"],
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          message: { type: "string", example: "Fetched buyer RFQs" },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/RfqItem" },
          },
        },
      },
      SupplierRfqListResponse: {
        type: "object",
        required: ["success", "statusCode", "message", "data"],
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          message: { type: "string", example: "Fetched open RFQs" },
          data: {
            type: "object",
            required: ["rfqs", "pagination"],
            properties: {
              rfqs: {
                type: "array",
                items: { $ref: "#/components/schemas/RfqItem" },
              },
              pagination: {
                type: "object",
                required: ["total", "page", "limit", "totalPages"],
                properties: {
                  total: { type: "integer", example: 45 },
                  page: { type: "integer", example: 1 },
                  limit: { type: "integer", example: 20 },
                  totalPages: { type: "integer", example: 3 },
                },
              },
            },
          },
        },
      },

      // ── Quotation Schemas ──────────────────────────────────────────────────
      CreateQuotationRequest: {
        type: "object",
        required: ["quotedPrice", "estimatedDeliveryDays"],
        description: "Canonical quotation submission schema.",
        properties: {
          quotedPrice: {
            type: "number",
            minimum: 0.01,
            description: "Positive finite numeric quoted price.",
            example: 45000.0,
          },
          estimatedDeliveryDays: {
            type: "integer",
            minimum: 1,
            description: "Positive integer delivery lead time in days.",
            example: 14,
          },
          message: {
            type: "string",
            maxLength: 1000,
            description: "Optional supplier message up to 1000 characters.",
            example: "Includes production inspection and material certification.",
          },
        },
      },
      QuotationItem: {
        type: "object",
        required: [
          "id",
          "rfqId",
          "supplierId",
          "quotedPrice",
          "estimatedDeliveryDays",
          "message",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "e4b6c891-62a3-4d7a-8b89-a2123e456789",
          },
          rfqId: {
            type: "string",
            format: "uuid",
            example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          },
          supplierId: {
            type: "string",
            format: "uuid",
            example: "d87a412b-63de-4cf3-94df-73bb8574ac3b",
          },
          quotedPrice: {
            type: "number",
            example: 45000.0,
          },
          estimatedDeliveryDays: {
            type: "integer",
            example: 14,
          },
          message: {
            type: "string",
            nullable: true,
            example: "Includes production inspection and material certification.",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-09-12T12:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2026-09-12T12:00:00.000Z",
          },
          supplier: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid", example: "d87a412b-63de-4cf3-94df-73bb8574ac3b" },
              name: { type: "string", example: "Precision Components Ltd" },
              email: { type: "string", format: "email", example: "sales@precision.com" },
            },
          },
          rfq: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              productName: { type: "string" },
              description: { type: "string" },
              quantity: { type: "integer" },
              location: { type: "string" },
              deadline: { type: "string", format: "date-time" },
              status: { type: "string", enum: ["OPEN", "CLOSED"] },
            },
          },
        },
      },
      QuotationDetailResponse: {
        type: "object",
        required: ["success", "statusCode", "message", "data"],
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 201 },
          message: { type: "string", example: "Quotation submitted successfully" },
          data: { $ref: "#/components/schemas/QuotationItem" },
        },
      },
      RfqQuotationsListResponse: {
        type: "object",
        required: ["success", "statusCode", "message", "data"],
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          message: { type: "string", example: "Fetched RFQ quotations" },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/QuotationItem" },
          },
        },
      },
      SupplierQuotationsListResponse: {
        type: "object",
        required: ["success", "statusCode", "message", "data"],
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          message: { type: "string", example: "Fetched supplier quotations" },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/QuotationItem" },
          },
        },
      },
    },
  },
};

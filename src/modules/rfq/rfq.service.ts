import { Prisma, RfqStatus, Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { CreateRfqInput, UpdateRfqInput, RfqFilterQuery } from "./rfq.schema";

export class RfqService {
  /**
   * Creates a new RFQ authored by the authenticated buyer.
   * Starts in OPEN status by default.
   */
  async createRfq(buyerId: string, input: CreateRfqInput) {
    const rfq = await prisma.rfq.create({
      data: {
        buyerId,
        productName: input.productName,
        description: input.description,
        quantity: input.quantity,
        location: input.location,
        deadline: input.deadline,
        status: RfqStatus.OPEN,
      },
      include: {
        buyer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return rfq;
  }

  /**
   * Fetches all RFQs created by the authenticated buyer.
   * Includes quotation count for each RFQ.
   */
  async getBuyerRfqs(buyerId: string) {
    const rfqs = await prisma.rfq.findMany({
      where: { buyerId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { quotations: true },
        },
      },
    });

    return rfqs;
  }

  /**
   * Updates an RFQ owned by the authenticated buyer.
   *
   * Business Rules:
   * - Must exist (404 if not)
   * - Must be owned by the calling buyer (403 if not)
   * - A CLOSED RFQ cannot be reopened (400 if attempting status: OPEN)
   * - A CLOSED RFQ cannot have its content modified (400 if already closed)
   * - An OPEN RFQ can have content modified and/or transition to CLOSED
   */
  async updateRfq(rfqId: string, buyerId: string, input: UpdateRfqInput) {
    const rfq = await prisma.rfq.findUnique({
      where: { id: rfqId },
    });

    if (!rfq) {
      throw new ApiError(404, "RFQ not found");
    }

    if (rfq.buyerId !== buyerId) {
      throw new ApiError(403, "Forbidden: You do not own this RFQ");
    }

    // Enforce lifecycle rule: CLOSED RFQ cannot be modified or reopened
    if (rfq.status === RfqStatus.CLOSED) {
      if (input.status === RfqStatus.OPEN) {
        throw new ApiError(400, "Cannot reopen a closed RFQ");
      }
      throw new ApiError(400, "Cannot modify a closed RFQ");
    }

    const updatedRfq = await prisma.rfq.update({
      where: { id: rfqId },
      data: input,
      include: {
        buyer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return updatedRfq;
  }

  /**
   * Fetches available RFQs for suppliers to browse.
   * Only returns RFQs where status is OPEN and deadline has not passed.
   * Supports search (productName, description) and location filters with pagination.
   */
  async getSupplierOpenRfqs(filters: RfqFilterQuery) {
    const now = new Date();

    const where: Prisma.RfqWhereInput = {
      status: RfqStatus.OPEN,
      deadline: { gte: now },
    };

    if (filters.search) {
      where.OR = [
        { productName: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.location) {
      where.location = { contains: filters.location, mode: "insensitive" };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [rfqs, total] = await Promise.all([
      prisma.rfq.findMany({
        where,
        skip,
        take: limit,
        orderBy: { deadline: "asc" },
        include: {
          buyer: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.rfq.count({ where }),
    ]);

    return {
      rfqs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Fetches a single RFQ by ID with role-sensitive authorization:
   * - BUYER: can only view their own RFQ (403 if not owner).
   * - SUPPLIER: can only view OPEN and non-expired RFQs (403 if closed or expired).
   */
  async getRfqById(rfqId: string, user: { id: string; role: Role }) {
    const rfq = await prisma.rfq.findUnique({
      where: { id: rfqId },
      include: {
        buyer: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { quotations: true },
        },
      },
    });

    if (!rfq) {
      throw new ApiError(404, "RFQ not found");
    }

    if (user.role === Role.BUYER) {
      if (rfq.buyerId !== user.id) {
        throw new ApiError(403, "Forbidden: You do not own this RFQ");
      }
    } else if (user.role === Role.SUPPLIER) {
      const isExpired = rfq.deadline.getTime() < Date.now();
      if (rfq.status === RfqStatus.CLOSED || isExpired) {
        throw new ApiError(403, "Forbidden: This RFQ is closed or expired");
      }
    }

    return rfq;
  }
}

export const rfqService = new RfqService();

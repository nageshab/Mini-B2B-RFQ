import { Prisma, RfqStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { CreateQuotationInput } from "./quotation.schema";

export class QuotationService {
  /**
   * Submits a new quotation for an RFQ by an authenticated supplier.
   *
   * Business Rules:
   * - RFQ must exist (404)
   * - RFQ status must be OPEN (400)
   * - RFQ deadline must not have passed (400)
   * - Supplier can submit only one quotation per RFQ (409)
   * - Stores price safely as Prisma.Decimal (12, 2)
   */
  async submitQuotation(
    rfqId: string,
    supplierId: string,
    input: CreateQuotationInput
  ) {
    const rfq = await prisma.rfq.findUnique({
      where: { id: rfqId },
    });

    if (!rfq) {
      throw new ApiError(404, "RFQ not found");
    }

    if (rfq.status !== RfqStatus.OPEN) {
      throw new ApiError(400, "Cannot submit quotation for a closed RFQ");
    }

    if (rfq.deadline.getTime() < Date.now()) {
      throw new ApiError(400, "Cannot submit quotation for an expired RFQ");
    }

    // Explicit check for duplicate submission before writing
    const existing = await prisma.quotation.findUnique({
      where: {
        rfqId_supplierId: {
          rfqId,
          supplierId,
        },
      },
    });

    if (existing) {
      throw new ApiError(409, "Quotation already submitted for this RFQ");
    }

    try {
      const quotation = await prisma.quotation.create({
        data: {
          rfqId,
          supplierId,
          price: new Prisma.Decimal(input.quotedPrice.toFixed(2)),
          estimatedDeliveryDays: input.estimatedDeliveryDays,
          notes: input.message || null,
        },
        include: {
          supplier: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return {
        id: quotation.id,
        rfqId: quotation.rfqId,
        supplierId: quotation.supplierId,
        quotedPrice: Number(quotation.price),
        price: Number(quotation.price),
        estimatedDeliveryDays: quotation.estimatedDeliveryDays,
        message: quotation.notes,
        notes: quotation.notes,
        createdAt: quotation.createdAt,
        updatedAt: quotation.updatedAt,
        supplier: quotation.supplier,
      };
    } catch (error) {
      // Catch concurrent unique constraint collision (P2002) as final defense
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ApiError(409, "Quotation already submitted for this RFQ");
      }
      throw error;
    }
  }

  /**
   * Retrieves all quotations received for a specific RFQ.
   * Strictly enforces buyer ownership: only the buyer who authored the RFQ
   * can view its submitted quotations (403 otherwise).
   */
  async getRfqQuotations(rfqId: string, buyerId: string) {
    const rfq = await prisma.rfq.findUnique({
      where: { id: rfqId },
    });

    if (!rfq) {
      throw new ApiError(404, "RFQ not found");
    }

    if (rfq.buyerId !== buyerId) {
      throw new ApiError(
        403,
        "Forbidden: You do not have permission to view quotations for this RFQ"
      );
    }

    const quotations = await prisma.quotation.findMany({
      where: { rfqId },
      orderBy: { createdAt: "desc" },
      include: {
        supplier: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return quotations.map((q) => ({
      id: q.id,
      rfqId: q.rfqId,
      supplierId: q.supplierId,
      quotedPrice: Number(q.price),
      price: Number(q.price),
      estimatedDeliveryDays: q.estimatedDeliveryDays,
      message: q.notes,
      notes: q.notes,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      supplier: q.supplier,
    }));
  }

  /**
   * Retrieves all quotations submitted by the authenticated supplier.
   * Includes essential RFQ details for each submission.
   */
  async getSupplierQuotations(supplierId: string) {
    const quotations = await prisma.quotation.findMany({
      where: { supplierId },
      orderBy: { createdAt: "desc" },
      include: {
        rfq: {
          select: {
            id: true,
            productName: true,
            description: true,
            quantity: true,
            location: true,
            deadline: true,
            status: true,
          },
        },
      },
    });

    return quotations.map((q) => ({
      id: q.id,
      rfqId: q.rfqId,
      supplierId: q.supplierId,
      quotedPrice: Number(q.price),
      price: Number(q.price),
      estimatedDeliveryDays: q.estimatedDeliveryDays,
      message: q.notes,
      notes: q.notes,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      rfq: q.rfq,
    }));
  }
}

export const quotationService = new QuotationService();

import { Request, Response } from "express";
import { quotationService } from "./quotation.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { CreateQuotationInput } from "./quotation.schema";

export class QuotationController {
  /**
   * POST /api/rfqs/:id/quotations
   * Submits a quotation for an RFQ on behalf of the authenticated supplier.
   */
  async submit(req: Request, res: Response): Promise<void> {
    const rfqId = req.params.id as string;
    const supplierId = req.user!.id;
    const quotation = await quotationService.submitQuotation(
      rfqId,
      supplierId,
      req.body as CreateQuotationInput
    );
    res
      .status(201)
      .json(new ApiResponse(201, "Quotation submitted successfully", quotation));
  }

  /**
   * GET /api/rfqs/:id/quotations
   * Retrieves all quotations for an RFQ. Only accessible by the RFQ's owning buyer.
   */
  async getByRfq(req: Request, res: Response): Promise<void> {
    const rfqId = req.params.id as string;
    const buyerId = req.user!.id;
    const quotations = await quotationService.getRfqQuotations(rfqId, buyerId);
    res
      .status(200)
      .json(new ApiResponse(200, "Fetched RFQ quotations", quotations));
  }

  /**
   * GET /api/quotations/mine
   * Retrieves all quotations submitted by the authenticated supplier.
   */
  async getMine(req: Request, res: Response): Promise<void> {
    const supplierId = req.user!.id;
    const quotations = await quotationService.getSupplierQuotations(supplierId);
    res
      .status(200)
      .json(new ApiResponse(200, "Fetched supplier quotations", quotations));
  }
}

export const quotationController = new QuotationController();

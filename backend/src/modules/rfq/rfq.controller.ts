import { Request, Response } from "express";
import { rfqService } from "./rfq.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { CreateRfqInput, UpdateRfqInput, RfqFilterQuery } from "./rfq.schema";

export class RfqController {
  /**
   * POST /api/rfqs
   * Creates a new RFQ authored by the authenticated buyer.
   */
  async create(req: Request, res: Response): Promise<void> {
    const rfq = await rfqService.createRfq(
      req.user!.id,
      req.body as CreateRfqInput
    );
    res
      .status(201)
      .json(new ApiResponse(201, "RFQ created successfully", rfq));
  }

  /**
   * GET /api/rfqs/mine
   * Returns all RFQs authored by the authenticated buyer.
   */
  async getMine(req: Request, res: Response): Promise<void> {
    const rfqs = await rfqService.getBuyerRfqs(req.user!.id);
    res.status(200).json(new ApiResponse(200, "Fetched buyer RFQs", rfqs));
  }

  /**
   * PUT /api/rfqs/:id
   * Updates an RFQ owned by the authenticated buyer.
   */
  async update(req: Request, res: Response): Promise<void> {
    const rfq = await rfqService.updateRfq(
      req.params.id as string,
      req.user!.id,
      req.body as UpdateRfqInput
    );
    res
      .status(200)
      .json(new ApiResponse(200, "RFQ updated successfully", rfq));
  }

  /**
   * GET /api/rfqs
   * Returns open, unexpired RFQs for browsing suppliers.
   */
  async getSupplierRfqs(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as RfqFilterQuery;
    const result = await rfqService.getSupplierOpenRfqs(query);
    res
      .status(200)
      .json(new ApiResponse(200, "Fetched available RFQs", result));
  }

  /**
   * GET /api/rfqs/:id
   * Returns details for a single RFQ with role-sensitive authorization.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const rfq = await rfqService.getRfqById(req.params.id as string, req.user!);
    res
      .status(200)
      .json(new ApiResponse(200, "Fetched RFQ details", rfq));
  }
}

export const rfqController = new RfqController();

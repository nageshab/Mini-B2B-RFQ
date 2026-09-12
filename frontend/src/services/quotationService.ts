import { apiClient } from "../lib/api";
import { SupplierQuotationItem, Quotation, SubmitQuotationInput } from "../types/rfq";

export const quotationService = {
  /**
   * Fetches all quotations submitted by the authenticated supplier.
   * Calls GET /api/quotations/mine
   */
  async getMyQuotations(): Promise<SupplierQuotationItem[]> {
    const response = await apiClient<SupplierQuotationItem[]>("/quotations/mine");
    return response.data;
  },

  /**
   * Submits a new commercial quotation for an open, unexpired RFQ.
   * Calls POST /api/rfqs/:id/quotations
   */
  async submitQuotation(
    rfqId: string,
    input: SubmitQuotationInput
  ): Promise<Quotation> {
    const response = await apiClient<Quotation>(`/rfqs/${rfqId}/quotations`, {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.data;
  },
};


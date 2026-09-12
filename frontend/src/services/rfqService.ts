import { apiClient } from "../lib/api";
import {
  BuyerRfqItem,
  RfqDetail,
  CreateRfqInput,
  UpdateRfqInput,
  Quotation,
  MarketplaceResponse,
  MarketplaceFilterParams,
} from "../types/rfq";

export const rfqService = {
  /**
   * Fetches all RFQs authored by the authenticated buyer.
   * Calls GET /api/rfqs/mine
   */
  async getMyRfqs(): Promise<BuyerRfqItem[]> {
    const response = await apiClient<BuyerRfqItem[]>("/rfqs/mine");
    return response.data;
  },

  /**
   * Fetches full RFQ details by UUID.
   * Calls GET /api/rfqs/:id
   */
  async getRfqById(id: string): Promise<RfqDetail> {
    const response = await apiClient<RfqDetail>(`/rfqs/${id}`);
    return response.data;
  },

  /**
   * Creates a new RFQ authored by the authenticated buyer.
   * Calls POST /api/rfqs
   */
  async createRfq(input: CreateRfqInput): Promise<RfqDetail> {
    const response = await apiClient<RfqDetail>("/rfqs", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.data;
  },

  /**
   * Updates an existing RFQ owned by the authenticated buyer.
   * Calls PUT /api/rfqs/:id
   */
  async updateRfq(id: string, input: UpdateRfqInput): Promise<RfqDetail> {
    const response = await apiClient<RfqDetail>(`/rfqs/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return response.data;
  },

  /**
   * Closes an OPEN RFQ owned by the authenticated buyer.
   * Calls PUT /api/rfqs/:id with body { status: "CLOSED" }
   */
  async closeRfq(id: string): Promise<RfqDetail> {
    const response = await apiClient<RfqDetail>(`/rfqs/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "CLOSED" }),
    });
    return response.data;
  },

  /**
   * Retrieves all quotations received for a specific RFQ.
   * Calls GET /api/rfqs/:id/quotations
   */
  async getRfqQuotations(id: string): Promise<Quotation[]> {
    const response = await apiClient<Quotation[]>(`/rfqs/${id}/quotations`);
    return response.data;
  },

  /**
   * Fetches open, unexpired RFQs from the supplier marketplace.
   * Calls GET /api/rfqs with optional search, location, page, and limit query params.
   */
  async getMarketplaceRfqs(
    params?: MarketplaceFilterParams
  ): Promise<MarketplaceResponse> {
    const searchParams = new URLSearchParams();
    if (params?.search) {
      searchParams.append("search", params.search);
    }
    if (params?.location) {
      searchParams.append("location", params.location);
    }
    if (params?.page) {
      searchParams.append("page", String(params.page));
    }
    if (params?.limit) {
      searchParams.append("limit", String(params.limit));
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/rfqs?${queryString}` : "/rfqs";
    const response = await apiClient<MarketplaceResponse>(endpoint);
    return response.data;
  },
};

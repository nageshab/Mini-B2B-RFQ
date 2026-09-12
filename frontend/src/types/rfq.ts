export type RfqStatus = "OPEN" | "CLOSED";

export interface BaseRfq {
  id: string;
  buyerId: string;
  productName: string;
  description: string;
  quantity: number;
  location: string;
  deadline: string;
  status: RfqStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * RFQ as returned by GET /api/rfqs/mine
 * Includes quotation counter.
 */
export interface BuyerRfqItem extends BaseRfq {
  _count?: {
    quotations: number;
  };
}

/**
 * Full RFQ detail as returned by GET /api/rfqs/:id
 * Includes buyer info and quotation counter.
 */
export interface RfqDetail extends BaseRfq {
  buyer?: {
    id: string;
    name: string;
    email?: string;
  };
  _count?: {
    quotations: number;
  };
}

export interface CreateRfqInput {
  productName: string;
  description: string;
  quantity: number;
  location: string;
  deadline: string;
}

export interface UpdateRfqInput {
  productName?: string;
  description?: string;
  quantity?: number;
  location?: string;
  deadline?: string;
  status?: RfqStatus;
}

/**
 * Canonical Quotation as returned by GET /api/rfqs/:id/quotations
 * Strictly canonical fields only (no legacy aliases).
 */
export interface Quotation {
  id: string;
  rfqId: string;
  supplierId: string;
  quotedPrice: number;
  estimatedDeliveryDays: number;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  supplier: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * RFQ item as returned by GET /api/rfqs (Supplier Marketplace)
 */
export interface MarketplaceRfqItem extends BaseRfq {
  buyer: {
    id: string;
    name: string;
  };
}

export interface MarketplacePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MarketplaceResponse {
  rfqs: MarketplaceRfqItem[];
  pagination: MarketplacePagination;
}

export interface MarketplaceFilterParams {
  search?: string;
  location?: string;
  page?: number;
  limit?: number;
}

/**
 * Quotation item as returned by GET /api/quotations/mine (Supplier Quotation History)
 * Strictly canonical fields only.
 */
export interface SupplierQuotationItem {
  id: string;
  rfqId: string;
  supplierId: string;
  quotedPrice: number;
  estimatedDeliveryDays: number;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  rfq: {
    id: string;
    productName: string;
    description: string;
    quantity: number;
    location: string;
    deadline: string;
    status: RfqStatus;
  };
}

/**
 * Payload for submitting a new quotation via POST /api/rfqs/:id/quotations
 * Strictly canonical fields only.
 */
export interface SubmitQuotationInput {
  quotedPrice: number;
  estimatedDeliveryDays: number;
  message: string;
}



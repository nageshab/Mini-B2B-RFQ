import { useQuery } from "@tanstack/react-query";
import { rfqService } from "../services/rfqService";
import { MarketplaceFilterParams, MarketplaceResponse } from "../types/rfq";

export const marketplaceKeys = {
  all: ["rfqs", "marketplace"] as const,
  list: (params: MarketplaceFilterParams) =>
    [...marketplaceKeys.all, params] as const,
};

/**
 * Fetches open, unexpired RFQs from the marketplace with search, location filter, and pagination.
 * Query key includes all parameter values to ensure automatic caching and reactivity.
 */
export function useMarketplaceRfqs(params: MarketplaceFilterParams) {
  return useQuery<MarketplaceResponse>({
    queryKey: marketplaceKeys.list(params),
    queryFn: () => rfqService.getMarketplaceRfqs(params),
    placeholderData: (previousData) => previousData,
  });
}

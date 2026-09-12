import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationService } from "../services/quotationService";
import { SupplierQuotationItem, SubmitQuotationInput } from "../types/rfq";
import { rfqKeys } from "./useRfqs";

export const quotationKeys = {
  all: ["quotations"] as const,
  mine: () => [...quotationKeys.all, "mine"] as const,
};

/**
 * Fetches all quotations submitted by the authenticated supplier.
 */
export function useMyQuotations() {
  return useQuery<SupplierQuotationItem[]>({
    queryKey: quotationKeys.mine(),
    queryFn: () => quotationService.getMyQuotations(),
  });
}

/**
 * Mutation hook for submitting a new quotation for an RFQ.
 * On success, invalidates supplier's quotation history and the RFQ's details cache.
 */
export function useSubmitQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rfqId,
      data,
    }: {
      rfqId: string;
      data: SubmitQuotationInput;
    }) => quotationService.submitQuotation(rfqId, data),
    onSuccess: (_, { rfqId }) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.mine() });
      queryClient.invalidateQueries({ queryKey: rfqKeys.detail(rfqId) });
    },
  });
}


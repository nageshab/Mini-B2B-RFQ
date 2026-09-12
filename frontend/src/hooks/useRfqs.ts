import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rfqService } from "../services/rfqService";
import { CreateRfqInput, UpdateRfqInput } from "../types/rfq";

export const rfqKeys = {
  all: ["rfqs"] as const,
  mine: () => [...rfqKeys.all, "mine"] as const,
  detail: (id: string) => [...rfqKeys.all, "detail", id] as const,
  quotations: (id: string) => [...rfqKeys.all, "quotations", id] as const,
};

/**
 * Fetches all RFQs created by the authenticated buyer.
 */
export function useMyRfqs() {
  return useQuery({
    queryKey: rfqKeys.mine(),
    queryFn: () => rfqService.getMyRfqs(),
  });
}

/**
 * Fetches single RFQ details by UUID.
 */
export function useRfq(id: string) {
  return useQuery({
    queryKey: rfqKeys.detail(id),
    queryFn: () => rfqService.getRfqById(id),
    enabled: !!id,
  });
}

/**
 * Fetches quotations received for an RFQ.
 */
export function useRfqQuotations(id: string) {
  return useQuery({
    queryKey: rfqKeys.quotations(id),
    queryFn: () => rfqService.getRfqQuotations(id),
    enabled: !!id,
  });
}

/**
 * Mutation hook for creating a new RFQ.
 */
export function useCreateRfq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRfqInput) => rfqService.createRfq(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rfqKeys.mine() });
    },
  });
}

/**
 * Mutation hook for updating an existing RFQ.
 */
export function useUpdateRfq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRfqInput }) =>
      rfqService.updateRfq(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: rfqKeys.mine() });
      queryClient.invalidateQueries({ queryKey: rfqKeys.detail(id) });
    },
  });
}

/**
 * Mutation hook for closing an open RFQ.
 */
export function useCloseRfq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rfqService.closeRfq(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: rfqKeys.mine() });
      queryClient.invalidateQueries({ queryKey: rfqKeys.detail(id) });
    },
  });
}

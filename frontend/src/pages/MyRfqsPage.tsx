import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMyRfqs, useCloseRfq } from "../hooks/useRfqs";
import { BuyerRfqItem } from "../types/rfq";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { RfqCard } from "../components/rfq/RfqCard";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import {
  PlusCircle,
  FileText,
  Search,
  Loader2,
  AlertCircle,
  Filter,
} from "lucide-react";

export const MyRfqsPage: React.FC = () => {
  const { data: rfqs, isLoading, isError, error } = useMyRfqs();
  const closeMutation = useCloseRfq();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">(
    "ALL"
  );
  const [rfqToClose, setRfqToClose] = useState<BuyerRfqItem | null>(null);

  // Client-side filtering over already-fetched rfqs
  const filteredRfqs = useMemo(() => {
    if (!rfqs) return [];

    return rfqs.filter((rfq) => {
      // Status filter
      if (statusFilter !== "ALL" && rfq.status !== statusFilter) {
        return false;
      }

      // Search query in productName, description, or location
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchProduct = rfq.productName.toLowerCase().includes(q);
        const matchDesc = rfq.description.toLowerCase().includes(q);
        const matchLoc = rfq.location.toLowerCase().includes(q);
        if (!matchProduct && !matchDesc && !matchLoc) {
          return false;
        }
      }

      return true;
    });
  }, [rfqs, search, statusFilter]);

  const handleConfirmClose = async () => {
    if (!rfqToClose) return;
    try {
      await closeMutation.mutateAsync(rfqToClose.id);
      setRfqToClose(null);
    } catch {
      // Error handled by mutation state
    }
  };

  const totalCount = rfqs?.length ?? 0;
  const openCount = rfqs?.filter((r) => r.status === "OPEN").length ?? 0;
  const closedCount = rfqs?.filter((r) => r.status === "CLOSED").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My RFQs
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View, track, and manage all requests for quotation published by your organization.
          </p>
        </div>

        <Link to="/buyer/rfqs/new">
          <Button size="md" className="shadow-sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create New RFQ
          </Button>
        </Link>
      </div>

      {/* Client-Side Search and Filter Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product, description, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center space-x-1.5 self-start md:self-auto bg-slate-100 p-1 rounded-md text-xs font-medium">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded transition-colors ${
              statusFilter === "ALL"
                ? "bg-white text-slate-900 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("OPEN")}
            className={`px-3 py-1.5 rounded transition-colors ${
              statusFilter === "OPEN"
                ? "bg-white text-emerald-700 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Open ({openCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("CLOSED")}
            className={`px-3 py-1.5 rounded transition-colors ${
              statusFilter === "CLOSED"
                ? "bg-white text-slate-800 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Closed ({closedCount})
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">Loading your RFQs...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start space-x-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to fetch RFQs</p>
            <p className="text-xs mt-0.5 text-red-600">
              {(error as Error)?.message || "Please check your network and try again."}
            </p>
          </div>
        </div>
      )}

      {/* Empty State: No RFQs Created Yet */}
      {!isLoading && !isError && totalCount === 0 && (
        <Card className="p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No RFQs published yet</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            Create your first procurement request to start receiving competitive quotations from verified suppliers.
          </p>
          <div className="mt-6">
            <Link to="/buyer/rfqs/new">
              <Button size="md">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create New RFQ
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Empty State: No matches for search/filter */}
      {!isLoading && !isError && totalCount > 0 && filteredRfqs.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Filter className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No matching RFQs found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your search keywords or switching the status filter tab.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
            className="mt-4 text-xs"
          >
            Clear Filters
          </Button>
        </Card>
      )}

      {/* RFQ Grid */}
      {!isLoading && !isError && filteredRfqs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRfqs.map((rfq) => (
            <RfqCard
              key={rfq.id}
              rfq={rfq}
              onCloseClick={(target) => setRfqToClose(target)}
            />
          ))}
        </div>
      )}

      {/* Close Confirmation Modal */}
      <ConfirmModal
        isOpen={!!rfqToClose}
        title="Close this RFQ?"
        description={`Are you sure you want to close "${rfqToClose?.productName}"? Once closed, this RFQ cannot be reopened.`}
        confirmText="Yes, Close RFQ"
        isConfirming={closeMutation.isPending}
        onConfirm={handleConfirmClose}
        onCancel={() => setRfqToClose(null)}
      />
    </div>
  );
};

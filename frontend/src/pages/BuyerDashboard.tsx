import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMyRfqs, useCloseRfq } from "../hooks/useRfqs";
import { BuyerRfqItem } from "../types/rfq";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { RfqCard } from "../components/rfq/RfqCard";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import {
  PlusCircle,
  FileText,
  Clock,
  Lock,
  MessageSquareQuote,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

export const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: rfqs, isLoading, isError, error } = useMyRfqs();
  const closeMutation = useCloseRfq();

  const [rfqToClose, setRfqToClose] = useState<BuyerRfqItem | null>(null);

  // Derive metrics
  const totalCount = rfqs?.length ?? 0;
  const openCount = rfqs?.filter((r) => r.status === "OPEN").length ?? 0;
  const closedCount = rfqs?.filter((r) => r.status === "CLOSED").length ?? 0;
  const quotesCount =
    rfqs?.reduce((acc, r) => acc + (r._count?.quotations ?? 0), 0) ?? 0;

  // Recent 3 RFQs
  const recentRfqs = rfqs?.slice(0, 3) ?? [];

  const handleConfirmClose = async () => {
    if (!rfqToClose) return;
    try {
      await closeMutation.mutateAsync(rfqToClose.id);
      setRfqToClose(null);
    } catch {
      // Error handled by TanStack Query state
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
              Buyer Portal
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Publish procurement requests, monitor bidding deadlines, and review competitive vendor proposals.
          </p>
        </div>

        <Link to="/buyer/rfqs/new">
          <Button size="md" className="shadow-sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create New RFQ
          </Button>
        </Link>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-none">
              {isLoading ? "..." : totalCount}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">Total RFQs</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-700 leading-none">
              {isLoading ? "..." : openCount}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">Open for Bidding</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-700 leading-none">
              {isLoading ? "..." : closedCount}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">Closed RFQs</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <MessageSquareQuote className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-700 leading-none">
              {isLoading ? "..." : quotesCount}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">Quotes Received</div>
          </div>
        </Card>
      </div>

      {/* Recent RFQs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recent RFQs</h2>
          {totalCount > 3 && (
            <Link
              to="/buyer/rfqs"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center"
            >
              View all ({totalCount}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Loading your RFQs...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start space-x-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to load RFQs</p>
              <p className="text-xs mt-0.5 text-red-600">
                {(error as Error)?.message || "Please check your network and try again."}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && totalCount === 0 && (
          <Card className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No RFQs created yet</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Post your first Request for Quotation to receive pricing proposals from verified suppliers.
            </p>
            <div className="mt-5">
              <Link to="/buyer/rfqs/new">
                <Button size="sm">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Create Your First RFQ
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* List of Recent RFQs */}
        {!isLoading && !isError && recentRfqs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentRfqs.map((rfq) => (
              <RfqCard
                key={rfq.id}
                rfq={rfq}
                onCloseClick={(target) => setRfqToClose(target)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Close Confirmation Modal */}
      <ConfirmModal
        isOpen={!!rfqToClose}
        title="Close this RFQ?"
        description={`Are you sure you want to close "${rfqToClose?.productName}"? Once closed, this RFQ cannot be reopened and suppliers will no longer be able to submit quotations.`}
        confirmText="Yes, Close RFQ"
        isConfirming={closeMutation.isPending}
        onConfirm={handleConfirmClose}
        onCancel={() => setRfqToClose(null)}
      />
    </div>
  );
};

import React from "react";
import { useParams, Link } from "react-router-dom";
import { useRfq, useRfqQuotations } from "../hooks/useRfqs";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";
import {
  ArrowLeft,
  MessageSquareQuote,
  DollarSign,
  Truck,
  Building,
  Mail,
  Clock,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";

export const RfqQuotationsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: rfq, isLoading: isRfqLoading } = useRfq(id || "");
  const {
    data: quotations,
    isLoading: isQuotesLoading,
    isError,
    error,
  } = useRfqQuotations(id || "");

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const isLoading = isRfqLoading || isQuotesLoading;
  const quoteCount = quotations?.length ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center space-x-2">
        <Link
          to={id ? `/buyer/rfqs/${id}` : "/buyer/rfqs"}
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to {rfq ? rfq.productName : "RFQ"}
        </Link>
      </div>

      {/* RFQ Context Header */}
      {rfq && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Quotations for {rfq.productName}
              </h1>
              <StatusBadge status={rfq.status} />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Required Quantity: <strong>{rfq.quantity.toLocaleString()} units</strong> &bull; Delivery:{" "}
              <strong>{rfq.location}</strong>
            </p>
          </div>

          <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md text-xs font-semibold text-blue-800 self-start sm:self-center">
            <MessageSquareQuote className="w-4 h-4 mr-1.5" />
            {quoteCount} {quoteCount === 1 ? "Quotation" : "Quotations"} Received
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">Loading received quotations...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start space-x-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to load quotations</p>
            <p className="text-xs mt-0.5 text-red-600">
              {(error as Error)?.message || "Please check your network connection and try again."}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && quoteCount === 0 && (
        <Card className="p-16 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <MessageSquareQuote className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No quotations received yet</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Verified marketplace suppliers will be able to review your specifications and submit competitive proposals while this RFQ is OPEN.
          </p>
          <div className="mt-6">
            <Link to={`/buyer/rfqs/${id}`}>
              <Button variant="outline" size="sm">
                View RFQ Details
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Quotations List */}
      {!isLoading && !isError && quoteCount > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Received Bids ({quoteCount})
          </h2>

          {quotations!.map((q, idx) => (
            <Card key={q.id} className="p-6 hover:border-slate-300 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-4 border-b border-slate-100">
                {/* Supplier Identity */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-base">
                      {q.supplier?.name || "Verified Supplier"}
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{q.supplier?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Quoted Pricing & Delivery Terms */}
                <div className="flex items-center space-x-6 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 self-start md:self-auto">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                      Quoted Total
                    </div>
                    <div className="text-lg font-bold text-slate-900 leading-tight text-emerald-700">
                      {formatCurrency(q.quotedPrice)}
                    </div>
                  </div>

                  <div className="border-l border-slate-200 pl-4">
                    <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                      Est. Delivery
                    </div>
                    <div className="text-sm font-semibold text-slate-900 leading-tight">
                      {q.estimatedDeliveryDays} {q.estimatedDeliveryDays === 1 ? "day" : "days"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplier Notes / Proposal Message */}
              {q.message && (
                <div className="pt-4 space-y-1">
                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Supplier Proposal Notes
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">
                    {q.message}
                  </p>
                </div>
              )}

              {/* Timestamp Footer */}
              <div className="pt-4 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Submitted on {formatDate(q.createdAt)}</span>
                </div>
                <span className="font-mono text-[11px]">Quote ID: {q.id.slice(0, 8)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

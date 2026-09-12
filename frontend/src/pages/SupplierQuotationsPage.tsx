import React from "react";
import { Link } from "react-router-dom";
import { useMyQuotations } from "../hooks/useQuotations";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";
import {
  MessageSquareQuote,
  Clock,
  Calendar,
  Layers,
  MapPin,
  ArrowRight,
  AlertCircle,
  Loader2,
  Package,
} from "lucide-react";

export const SupplierQuotationsPage: React.FC = () => {
  const { data: quotations, isLoading, isError, error, refetch } =
    useMyQuotations();

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (isoString?: string): string => {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Submitted Quotations
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track the commercial bids and delivery proposals you have submitted for buyer RFQs.
            </p>
          </div>

          <Link to="/supplier/rfqs">
            <Button size="sm" className="text-xs">
              Browse RFQ Marketplace <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">
            Loading your quotations...
          </p>
          <p className="text-xs text-slate-400 mt-1">Retrieving submission history</p>
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-red-700 shadow-sm">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Unable to load quotation history</p>
              <p className="text-xs text-red-600 mt-0.5">
                {(error as Error)?.message ||
                  "Please check your network connection and try again."}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs self-start sm:self-auto bg-white hover:bg-red-50 text-red-700 border-red-300"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && quotations?.length === 0 && (
        <Card className="p-16 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <MessageSquareQuote className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            No quotations submitted yet
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            You haven't submitted bids for any RFQs yet. Discover open buyer opportunities in the marketplace to submit competitive bids.
          </p>
          <div className="mt-6">
            <Link to="/supplier/rfqs">
              <Button size="sm">Browse RFQs</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Quotations List */}
      {!isLoading && !isError && quotations && quotations.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Submitted Bids ({quotations.length})
          </div>

          <div className="space-y-4">
            {quotations.map((q) => (
              <Card key={q.id} className="p-6 hover:border-slate-300 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-4 border-b border-slate-100">
                  {/* RFQ Reference */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <Link
                        to={`/supplier/rfqs/${q.rfqId}`}
                        className="font-bold text-slate-900 text-base hover:text-blue-600 transition-colors"
                      >
                        {q.rfq?.productName || "RFQ Submission"}
                      </Link>
                      {q.rfq?.status && <StatusBadge status={q.rfq.status} />}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                      {q.rfq?.quantity && (
                        <span className="flex items-center space-x-1">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span>Qty: {q.rfq.quantity.toLocaleString()}</span>
                        </span>
                      )}
                      {q.rfq?.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{q.rfq.location}</span>
                        </span>
                      )}
                      {q.rfq?.deadline && (
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Deadline: {formatDate(q.rfq.deadline)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quoted Commercial Terms */}
                  <div className="flex items-center space-x-6 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 self-start md:self-auto">
                    <div>
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                        Quoted Price
                      </div>
                      <div className="text-lg font-bold text-slate-900 leading-tight text-emerald-700">
                        {formatPrice(q.quotedPrice)}
                      </div>
                    </div>

                    <div className="border-l border-slate-200 pl-4">
                      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                        Est. Delivery
                      </div>
                      <div className="text-sm font-semibold text-slate-900 leading-tight">
                        {q.estimatedDeliveryDays}{" "}
                        {q.estimatedDeliveryDays === 1 ? "day" : "days"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quotation Message & Submission Info */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                  <div>
                    {q.message ? (
                      <p className="text-slate-600 italic bg-slate-50 px-3 py-1.5 rounded border border-slate-100">
                        &ldquo;{q.message}&rdquo;
                      </p>
                    ) : (
                      <span className="text-slate-400 italic">No message attached</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 flex-shrink-0 text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Submitted: {formatDate(q.createdAt)}</span>
                    </span>

                    <Link to={`/supplier/rfqs/${q.rfqId}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        View RFQ <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

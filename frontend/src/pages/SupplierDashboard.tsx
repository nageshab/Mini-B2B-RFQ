import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMyQuotations } from "../hooks/useQuotations";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  Search,
  MessageSquareQuote,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  MapPin,
  Loader2,
} from "lucide-react";

export const SupplierDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: quotations, isLoading: isQuotesLoading } = useMyQuotations();

  const submittedQuotesCount = quotations?.length ?? 0;
  const recentQuotations = quotations?.slice(0, 3) ?? [];

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
      {/* Welcome & Role Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-bold text-slate-900">
                Welcome back, {user?.name}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                Supplier Portal
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Browse live open market RFQs, submit competitive quotations, and track bid fulfillment.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/supplier/rfqs">
              <Button size="sm" className="text-xs">
                Browse Marketplace <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics & Quick Links Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Marketplace Explorer Card */}
        <Card className="p-6 hover:border-slate-300 transition-colors flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">
              Browse RFQ Marketplace
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Explore active, verified buyer requests across industries. Filter by delivery location and search specific requirements.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Open Opportunities</span>
            <Link to="/supplier/rfqs">
              <Button variant="outline" size="sm" className="text-xs">
                Explore RFQs <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Quotation History Card */}
        <Card className="p-6 hover:border-slate-300 transition-colors flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-slate-900">
                Submitted Quotations
              </h3>
              {isQuotesLoading ? (
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              ) : (
                <span className="text-lg font-bold text-slate-900">
                  {submittedQuotesCount}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Review your previously submitted commercial terms, quoted prices, lead times, and submission status.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Track Submissions</span>
            <Link to="/supplier/quotations">
              <Button variant="outline" size="sm" className="text-xs">
                View History <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Submissions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Recent Quotations
          </h2>
          {submittedQuotesCount > 0 && (
            <Link
              to="/supplier/quotations"
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              View all ({submittedQuotesCount}) &rarr;
            </Link>
          )}
        </div>

        {isQuotesLoading && (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center shadow-sm">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading recent submissions...</p>
          </div>
        )}

        {!isQuotesLoading && recentQuotations.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-sm text-slate-600 font-medium">
              No quotations submitted yet
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Find open buyer requirements in the marketplace to start quoting and win commercial deals.
            </p>
            <div className="mt-4">
              <Link to="/supplier/rfqs">
                <Button size="sm" className="text-xs">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {!isQuotesLoading && recentQuotations.length > 0 && (
          <div className="space-y-3">
            {recentQuotations.map((q) => (
              <div
                key={q.id}
                className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm hover:border-slate-300 transition-colors"
              >
                <div>
                  <Link
                    to={`/supplier/rfqs/${q.rfqId}`}
                    className="font-semibold text-slate-900 text-sm hover:text-blue-600 transition-colors"
                  >
                    {q.rfq?.productName || "RFQ Submission"}
                  </Link>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                    {q.rfq?.location && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{q.rfq.location}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(q.createdAt)}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-start sm:self-auto">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-medium">Quoted</div>
                    <div className="text-sm font-bold text-emerald-700">
                      {formatPrice(q.quotedPrice)}
                    </div>
                  </div>
                  <div className="text-right border-l border-slate-200 pl-4">
                    <div className="text-xs text-slate-400 font-medium">Delivery</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {q.estimatedDeliveryDays}d
                    </div>
                  </div>
                  <Link to={`/supplier/rfqs/${q.rfqId}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      View RFQ
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

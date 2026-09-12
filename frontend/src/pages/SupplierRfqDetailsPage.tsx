import React from "react";
import { useParams, Link } from "react-router-dom";
import { useRfq } from "../hooks/useRfqs";
import { StatusBadge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Layers,
  Building2,
  Mail,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { QuotationForm } from "../components/quotation/QuotationForm";

export const SupplierRfqDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: rfq, isLoading, isError, error } = useRfq(id || "");

  const formatDate = (isoString?: string): string => {
    if (!isoString) return "N/A";
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-lg p-16 text-center shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700">Loading RFQ details...</p>
        <p className="text-xs text-slate-400 mt-1">Fetching requirements from marketplace</p>
      </div>
    );
  }

  if (isError || !rfq) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Link
          to="/supplier/rfqs"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Marketplace
        </Link>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex items-start space-x-3 text-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">RFQ No Longer Available</h3>
            <p className="text-xs mt-1 text-amber-700">
              {(error as Error)?.message ||
                "This RFQ has closed, expired, or is no longer accepting supplier quotations."}
            </p>
            <div className="mt-4">
              <Link to="/supplier/rfqs">
                <Button variant="outline" size="sm" className="text-xs">
                  Browse Active RFQs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/supplier/rfqs"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to RFQ Marketplace
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {rfq.productName}
              </h1>
              <StatusBadge status={rfq.status} />
            </div>
            <p className="text-xs text-slate-400">
              RFQ ID: <span className="font-mono">{rfq.id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Key Specifications Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Quantity */}
        <Card className="p-5 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Required Quantity
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {rfq.quantity.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-500">units</span>
            </div>
          </div>
        </Card>

        {/* Delivery Location */}
        <Card className="p-5 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Delivery Location
            </div>
            <div className="text-base font-bold text-slate-900 mt-0.5 truncate">
              {rfq.location}
            </div>
          </div>
        </Card>

        {/* Bidding Deadline */}
        <Card className="p-5 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Bidding Deadline
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {formatDate(rfq.deadline)}
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Description */}
      <Card className="p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
          Requirement Specifications & Scope
        </h2>
        <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-md border border-slate-100 font-normal">
          {rfq.description}
        </div>
      </Card>

      {/* Buyer & Marketplace Information */}
      <Card className="p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">
          Buyer & Listing Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Buyer Identity */}
          <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-md border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">
                {rfq.buyer?.name || "Verified Enterprise Buyer"}
              </div>
              {rfq.buyer?.email && (
                <div className="flex items-center space-x-1 text-slate-500 mt-0.5">
                  <Mail className="w-3 h-3" />
                  <span>{rfq.buyer.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2 p-3 bg-slate-50 rounded-md border border-slate-100 text-slate-600">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1 text-slate-500">
                <Clock className="w-3.5 h-3.5 mr-1" /> Published:
              </span>
              <span className="font-medium text-slate-800">{formatDate(rfq.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1 text-slate-500">
                <Clock className="w-3.5 h-3.5 mr-1" /> Last Updated:
              </span>
              <span className="font-medium text-slate-800">{formatDate(rfq.updatedAt)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Supplier Quotation Submission Form */}
      <QuotationForm rfqId={rfq.id} />
    </div>
  );
};

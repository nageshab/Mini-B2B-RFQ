import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useRfq, useCloseRfq } from "../hooks/useRfqs";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Layers,
  MessageSquareQuote,
  Edit2,
  Lock,
  Loader2,
  AlertCircle,
  Building2,
  Clock,
} from "lucide-react";

export const RfqDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: rfq, isLoading, isError, error } = useRfq(id || "");
  const closeMutation = useCloseRfq();

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const formatDate = (isoString?: string): string => {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const handleConfirmClose = async () => {
    if (!id) return;
    try {
      await closeMutation.mutateAsync(id);
      setIsCloseModalOpen(false);
    } catch {
      // Handled by closeMutation.error
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-lg p-16 text-center shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700">Loading RFQ details...</p>
      </div>
    );
  }

  if (isError || !rfq) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Link
          to="/buyer/rfqs"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to My RFQs
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start space-x-3 text-red-700">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Unable to load RFQ</h3>
            <p className="text-sm mt-1">
              {(error as Error)?.message || "The requested RFQ could not be found or you do not have permission to view it."}
            </p>
            <div className="mt-4">
              <Link to="/buyer/rfqs">
                <Button variant="outline" size="sm">
                  Return to My RFQs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOpen = rfq.status === "OPEN";
  const quotationCount = rfq._count?.quotations ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/buyer/rfqs"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to My RFQs
        </Link>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <Link to={`/buyer/rfqs/${rfq.id}/quotations`}>
            <Button variant="outline" size="sm" className="shadow-xs">
              <MessageSquareQuote className="w-4 h-4 mr-1.5 text-blue-600" />
              View Quotations ({quotationCount})
            </Button>
          </Link>

          {isOpen && (
            <>
              <Link to={`/buyer/rfqs/${rfq.id}/edit`}>
                <Button variant="outline" size="sm" className="shadow-xs">
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                  Edit RFQ
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCloseModalOpen(true)}
                className="text-amber-700 hover:text-amber-800 hover:border-amber-300 shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                Close RFQ
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Details Card */}
      <Card className="p-8 shadow-sm">
        {/* Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {rfq.productName}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              RFQ ID: {rfq.id}
            </p>
          </div>
          <div className="self-start sm:self-center">
            <StatusBadge status={rfq.status} />
          </div>
        </div>

        {/* Specifications Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-100 bg-slate-50/50 -mx-8 px-8">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Required Quantity
              </div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {rfq.quantity.toLocaleString()} units
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100/60 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Delivery Location
              </div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">
                {rfq.location}
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100/60 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Bid Submission Deadline
              </div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">
                {formatDate(rfq.deadline)}
              </div>
            </div>
          </div>
        </div>

        {/* Requirement Description */}
        <div className="py-6 border-b border-slate-100 space-y-2">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Requirement Specifications
          </h2>
          <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-md border border-slate-100">
            {rfq.description}
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="pt-6 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Published on {formatDate(rfq.createdAt)}</span>
          </div>
          {rfq.updatedAt !== rfq.createdAt && (
            <span>Last updated on {formatDate(rfq.updatedAt)}</span>
          )}
        </div>
      </Card>

      {/* Close Confirmation Modal */}
      <ConfirmModal
        isOpen={isCloseModalOpen}
        title="Close this RFQ?"
        description="Once closed, this RFQ cannot be reopened. Suppliers will no longer be able to submit new quotations for this procurement."
        confirmText="Yes, Close RFQ"
        isConfirming={closeMutation.isPending}
        onConfirm={handleConfirmClose}
        onCancel={() => setIsCloseModalOpen(false)}
      />
    </div>
  );
};

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSubmitQuotation } from "../../hooks/useQuotations";
import { Quotation } from "../../types/rfq";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ApiClientError } from "../../lib/api";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  ArrowRight,
  Clock,
  Layers,
  ShoppingBag,
} from "lucide-react";

export interface QuotationFormProps {
  rfqId: string;
}

interface FormErrors {
  quotedPrice?: string;
  estimatedDeliveryDays?: string;
  message?: string;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({ rfqId }) => {
  const [priceInput, setPriceInput] = useState("");
  const [deliveryDaysInput, setDeliveryDaysInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<{
    status?: number;
    message: string;
  } | null>(null);
  const [submittedQuotation, setSubmittedQuotation] = useState<Quotation | null>(
    null
  );

  const submitMutation = useSubmitQuotation();

  const validate = (): boolean => {
    const errors: FormErrors = {};

    // 1. Validate Quoted Price
    const trimmedPrice = priceInput.trim();
    if (!trimmedPrice) {
      errors.quotedPrice = "Quoted price is required";
    } else {
      const parsedPrice = Number(trimmedPrice);
      if (isNaN(parsedPrice) || !isFinite(parsedPrice)) {
        errors.quotedPrice = "Quoted price must be a valid number";
      } else if (parsedPrice <= 0) {
        errors.quotedPrice = "Quoted price must be greater than 0";
      }
    }

    // 2. Validate Estimated Delivery Days
    const trimmedDays = deliveryDaysInput.trim();
    if (!trimmedDays) {
      errors.estimatedDeliveryDays = "Estimated delivery days is required";
    } else {
      const parsedDays = Number(trimmedDays);
      if (isNaN(parsedDays) || !Number.isInteger(parsedDays)) {
        errors.estimatedDeliveryDays = "Estimated delivery days must be a whole integer";
      } else if (parsedDays <= 0) {
        errors.estimatedDeliveryDays = "Estimated delivery days must be greater than 0";
      }
    }

    // 3. Validate Message
    if (messageInput.length > 1000) {
      errors.message = "Message must not exceed 1000 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    const payload = {
      quotedPrice: Number(priceInput.trim()),
      estimatedDeliveryDays: Number(deliveryDaysInput.trim()),
      message: messageInput.trim(), // Always send string (empty string "" if blank)
    };

    try {
      const result = await submitMutation.mutateAsync({
        rfqId,
        data: payload,
      });
      setSubmittedQuotation(result);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setApiError({
          status: err.statusCode,
          message: err.message,
        });
      } else {
        setApiError({
          status: 500,
          message: "Unable to submit quotation. Please check your network and try again.",
        });
      }
    }
  };

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // ── Success State ────────────────────────────────────────────────────────
  if (submittedQuotation) {
    return (
      <Card className="p-8 border-emerald-200 bg-emerald-50/40">
        <div className="flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Quotation Submitted Successfully
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Your commercial quotation has been dispatched to the buyer. You can monitor your proposal status in your quotation history.
          </p>

          {/* Proposal Summary Card */}
          <div className="w-full bg-white border border-emerald-200 rounded-lg p-4 mt-6 text-left shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Quoted Price
              </span>
              <span className="text-base font-bold text-emerald-700">
                {formatPrice(submittedQuotation.quotedPrice)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Estimated Delivery
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {submittedQuotation.estimatedDeliveryDays}{" "}
                {submittedQuotation.estimatedDeliveryDays === 1 ? "day" : "days"}
              </span>
            </div>

            {submittedQuotation.message && (
              <div className="pt-1">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                  Message
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100 italic">
                  &ldquo;{submittedQuotation.message}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <Link to="/supplier/quotations" className="w-full sm:w-auto">
              <Button size="sm" className="w-full text-xs">
                View My Quotations <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
            <Link to="/supplier/rfqs" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // ── Form Render ──────────────────────────────────────────────────────────
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Submit Your Quotation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit a competitive price and fulfillment lead time for this buyer RFQ.
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <Send className="w-4 h-4" />
        </div>
      </div>

      {/* API Error Banners */}
      {apiError && (
        <div className="mb-5">
          {/* 409 Conflict: Duplicate Quotation */}
          {apiError.status === 409 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-800 text-xs">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-sm">
                    Quotation Already Submitted
                  </span>
                  <span>
                    You have already submitted a quotation for this RFQ. Suppliers can only submit one quotation per RFQ.
                  </span>
                </div>
              </div>
              <Link to="/supplier/quotations" className="self-start sm:self-auto flex-shrink-0">
                <Button variant="outline" size="sm" className="text-xs bg-white text-amber-800 border-amber-300">
                  View in My Quotations
                </Button>
              </Link>
            </div>
          )}

          {/* 400 Bad Request: Closed / Expired / Business Rule rejection */}
          {apiError.status === 400 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-800 text-xs">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-sm">
                    Submission Rejected
                  </span>
                  <span>{apiError.message}</span>
                </div>
              </div>
              <Link to="/supplier/rfqs" className="self-start sm:self-auto flex-shrink-0">
                <Button variant="outline" size="sm" className="text-xs bg-white text-amber-800 border-amber-300">
                  <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          )}

          {/* 403 Forbidden: Unauthorized access */}
          {apiError.status === 403 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-sm">Access Forbidden</span>
                <span>
                  {apiError.message || "You do not have permission to submit quotations for this RFQ."}
                </span>
              </div>
            </div>
          )}

          {/* 404 Not Found: RFQ doesn't exist */}
          {apiError.status === 404 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-sm">RFQ Not Found</span>
                <span>The requested RFQ could not be found or has been removed.</span>
              </div>
            </div>
          )}

          {/* 500 / Network Error */}
          {apiError.status !== 409 &&
            apiError.status !== 400 &&
            apiError.status !== 403 &&
            apiError.status !== 404 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2.5 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-sm">Submission Error</span>
                  <span>{apiError.message}</span>
                </div>
              </div>
            )}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Row 1: Quoted Price & Delivery Days */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Quoted Price */}
          <div>
            <label
              htmlFor="quotedPrice"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Quoted Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="quotedPrice"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 45000"
                value={priceInput}
                onChange={(e) => {
                  setPriceInput(e.target.value);
                  if (fieldErrors.quotedPrice) {
                    setFieldErrors((prev) => ({ ...prev, quotedPrice: undefined }));
                  }
                }}
                disabled={submitMutation.isPending}
                className={fieldErrors.quotedPrice ? "border-red-500 focus:ring-red-500" : ""}
                aria-invalid={!!fieldErrors.quotedPrice}
                aria-describedby={fieldErrors.quotedPrice ? "quotedPrice-error" : undefined}
              />
            </div>
            {fieldErrors.quotedPrice && (
              <p id="quotedPrice-error" className="text-xs text-red-600 mt-1 font-medium">
                {fieldErrors.quotedPrice}
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Total commercial price proposed for the entire order quantity.
            </p>
          </div>

          {/* Estimated Delivery Days */}
          <div>
            <label
              htmlFor="estimatedDeliveryDays"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Estimated Delivery (Days) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="estimatedDeliveryDays"
                type="number"
                step="1"
                min="1"
                placeholder="e.g. 28"
                value={deliveryDaysInput}
                onChange={(e) => {
                  setDeliveryDaysInput(e.target.value);
                  if (fieldErrors.estimatedDeliveryDays) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      estimatedDeliveryDays: undefined,
                    }));
                  }
                }}
                disabled={submitMutation.isPending}
                className={
                  fieldErrors.estimatedDeliveryDays
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                }
                aria-invalid={!!fieldErrors.estimatedDeliveryDays}
                aria-describedby={
                  fieldErrors.estimatedDeliveryDays
                    ? "estimatedDeliveryDays-error"
                    : undefined
                }
              />
            </div>
            {fieldErrors.estimatedDeliveryDays && (
              <p
                id="estimatedDeliveryDays-error"
                className="text-xs text-red-600 mt-1 font-medium"
              >
                {fieldErrors.estimatedDeliveryDays}
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Calendar days from order placement to final delivery.
            </p>
          </div>
        </div>

        {/* Message (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="message"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              Message (Optional)
            </label>
            <span
              className={`text-[11px] ${
                messageInput.length > 1000 ? "text-red-600 font-bold" : "text-slate-400"
              }`}
            >
              {messageInput.length} / 1000
            </span>
          </div>
          <textarea
            id="message"
            rows={3}
            placeholder="Specify manufacturing capacity, quality certifications, warranty terms, or fulfillment details..."
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              if (fieldErrors.message) {
                setFieldErrors((prev) => ({ ...prev, message: undefined }));
              }
            }}
            disabled={submitMutation.isPending}
            className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 ${
              fieldErrors.message ? "border-red-500 focus:ring-red-500" : ""
            }`}
            aria-invalid={!!fieldErrors.message}
            aria-describedby={fieldErrors.message ? "message-error" : undefined}
          />
          {fieldErrors.message && (
            <p id="message-error" className="text-xs text-red-600 mt-1 font-medium">
              {fieldErrors.message}
            </p>
          )}
        </div>

        {/* Submit CTA */}
        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full sm:w-auto text-xs"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Submitting quotation...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Submit Quotation
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

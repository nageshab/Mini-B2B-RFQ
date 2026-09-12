import React from "react";
import { Link } from "react-router-dom";
import { BuyerRfqItem } from "../../types/rfq";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/Badge";
import {
  Calendar,
  MapPin,
  Layers,
  MessageSquareQuote,
  Eye,
  Edit2,
  Lock,
} from "lucide-react";

export interface RfqCardProps {
  rfq: BuyerRfqItem;
  onCloseClick?: (rfq: BuyerRfqItem) => void;
}

export const RfqCard: React.FC<RfqCardProps> = ({ rfq, onCloseClick }) => {
  const isOpen = rfq.status === "OPEN";
  const quotationCount = rfq._count?.quotations ?? 0;

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

  return (
    <Card className="p-5 hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        {/* Header: Title & Status */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <Link
            to={`/buyer/rfqs/${rfq.id}`}
            className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 text-base"
          >
            {rfq.productName}
          </Link>
          <StatusBadge status={rfq.status} />
        </div>

        {/* Description snippet */}
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {rfq.description}
        </p>

        {/* Specifications Matrix */}
        <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-500 py-3 border-y border-slate-100 mb-4">
          <div className="flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              Qty: <strong className="text-slate-800">{rfq.quantity.toLocaleString()}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate text-slate-700">{rfq.location}</span>
          </div>
          <div className="col-span-2 flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              Deadline: <strong className="text-slate-800">{formatDate(rfq.deadline)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Footer & Contextual Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {/* Quotations link */}
        <Link
          to={`/buyer/rfqs/${rfq.id}/quotations`}
          className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
            quotationCount > 0
              ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <MessageSquareQuote className="w-3.5 h-3.5 mr-1" />
          {quotationCount} {quotationCount === 1 ? "Quote" : "Quotes"}
        </Link>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <Link to={`/buyer/rfqs/${rfq.id}`}>
            <Button variant="outline" size="sm" className="text-xs">
              <Eye className="w-3.5 h-3.5 mr-1" />
              View
            </Button>
          </Link>

          {isOpen && (
            <>
              <Link to={`/buyer/rfqs/${rfq.id}/edit`}>
                <Button variant="outline" size="sm" className="text-xs">
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
              </Link>
              {onCloseClick && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCloseClick(rfq)}
                  className="text-xs text-amber-700 hover:text-amber-800 hover:border-amber-300"
                >
                  <Lock className="w-3.5 h-3.5 mr-1" />
                  Close
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

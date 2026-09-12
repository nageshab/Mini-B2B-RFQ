import React from "react";
import { Link } from "react-router-dom";
import { MarketplaceRfqItem } from "../../types/rfq";
import { Card } from "../ui/Card";
import { StatusBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import {
  Calendar,
  MapPin,
  Layers,
  Building2,
  ArrowRight,
} from "lucide-react";

export interface SupplierRfqCardProps {
  rfq: MarketplaceRfqItem;
}

export const SupplierRfqCard: React.FC<SupplierRfqCardProps> = ({ rfq }) => {
  const formatDate = (isoString: string): string => {
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
    <Card className="p-5 hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        {/* Top: Title & Status */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <Link
            to={`/supplier/rfqs/${rfq.id}`}
            className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 text-base"
          >
            {rfq.productName}
          </Link>
          <StatusBadge status={rfq.status} />
        </div>

        {/* Buyer info */}
        {rfq.buyer?.name && (
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-3">
            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">Buyer: {rfq.buyer.name}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {rfq.description}
        </p>

        {/* Specs Matrix */}
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
          <div className="flex items-center space-x-1.5 col-span-2">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              Bidding Deadline: <span className="font-medium text-slate-700">{formatDate(rfq.deadline)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-2">
        <Link to={`/supplier/rfqs/${rfq.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full text-xs">
            View RFQ Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};

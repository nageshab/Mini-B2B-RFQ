import React, { useState, useEffect } from "react";
import { useMarketplaceRfqs } from "../hooks/useMarketplace";
import { useDebounce } from "../hooks/useDebounce";
import { SupplierRfqCard } from "../components/supplier/SupplierRfqCard";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import {
  Search,
  MapPin,
  X,
  Loader2,
  AlertCircle,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const MarketplacePage: React.FC = () => {
  const [searchInput, setSearchInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  const debouncedSearch = useDebounce(searchInput, 350);
  const debouncedLocation = useDebounce(locationInput, 350);

  // Reset to first page when search or location filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, debouncedLocation]);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useMarketplaceRfqs({
      search: debouncedSearch.trim() || undefined,
      location: debouncedLocation.trim() || undefined,
      page,
      limit,
    });

  const rfqs = data?.rfqs ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const isFiltering =
    searchInput.trim().length > 0 || locationInput.trim().length > 0;

  const handleClearFilters = () => {
    setSearchInput("");
    setLocationInput("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                RFQ Marketplace
              </h1>
              {isFetching && !isLoading && (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Browse live, open RFQs from verified buyers across industries.
            </p>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-md border border-slate-200 self-start sm:self-auto">
            Total Available: <strong className="text-slate-800">{total}</strong>
          </div>
        </div>

        {/* Search & Location Filters */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search product name or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-8 text-xs sm:text-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Location Filter */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Filter by location (e.g. Detroit, Dallas)..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="pl-9 pr-8 text-xs sm:text-sm"
            />
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            {locationInput && (
              <button
                type="button"
                onClick={() => setLocationInput("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Clear Filters Action */}
          {isFiltering && (
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-slate-600 hover:text-slate-900"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">
            Loading RFQs from marketplace...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Fetching available opportunities
          </p>
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-red-700 shadow-sm">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Failed to load marketplace RFQs</p>
              <p className="text-xs text-red-600 mt-0.5">
                {(error as Error)?.message ||
                  "Unable to connect to the server. Please check your network and try again."}
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
      {!isLoading && !isError && rfqs.length === 0 && (
        <Card className="p-16 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            {isFiltering ? "No matching RFQs found" : "No open RFQs available"}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            {isFiltering
              ? "Try adjusting your keyword search or location filter to find available opportunities."
              : "There are currently no open and active buyer RFQs in the marketplace. Check back soon!"}
          </p>
          {isFiltering && (
            <div className="mt-6">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* RFQ Grid */}
      {!isLoading && !isError && rfqs.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rfqs.map((rfq) => (
              <SupplierRfqCard key={rfq.id} rfq={rfq} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="text-xs text-slate-500">
                Showing page <strong className="text-slate-800">{page}</strong> of{" "}
                <strong className="text-slate-800">{totalPages}</strong> ({total} total RFQs)
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1 || isFetching}
                  className="text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Previous
                </Button>

                <span className="text-xs font-medium text-slate-600 px-2">
                  {page} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page >= totalPages || isFetching}
                  className="text-xs"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

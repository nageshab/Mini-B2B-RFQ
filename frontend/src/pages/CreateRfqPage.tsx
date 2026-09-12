import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateRfq } from "../hooks/useRfqs";
import { CreateRfqInput } from "../types/rfq";
import { ApiClientError } from "../lib/api";
import { Card } from "../components/ui/Card";
import { RfqForm } from "../components/rfq/RfqForm";
import { ArrowLeft, PlusCircle } from "lucide-react";

export const CreateRfqPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateRfq();
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (values: CreateRfqInput) => {
    setApiError(null);
    try {
      await createMutation.mutateAsync(values);
      navigate("/buyer/rfqs");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setApiError(err.message);
      } else {
        setApiError("Unable to create RFQ. Please check your connection and try again.");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center space-x-2">
        <Link
          to="/buyer/rfqs"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to My RFQs
        </Link>
      </div>

      {/* Card Form */}
      <Card className="p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Create New RFQ
            </h1>
            <p className="text-xs text-slate-500">
              Publish your procurement requirements for suppliers across the marketplace.
            </p>
          </div>
        </div>

        <RfqForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          submitLabel={createMutation.isPending ? "Publishing RFQ..." : "Publish RFQ"}
          onCancel={() => navigate("/buyer/rfqs")}
          apiError={apiError}
        />
      </Card>
    </div>
  );
};

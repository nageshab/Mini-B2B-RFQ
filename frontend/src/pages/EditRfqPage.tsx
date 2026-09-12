import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useRfq, useUpdateRfq } from "../hooks/useRfqs";
import { CreateRfqInput } from "../types/rfq";
import { ApiClientError } from "../lib/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { RfqForm } from "../components/rfq/RfqForm";
import { ArrowLeft, Edit2, Loader2, Lock, AlertCircle } from "lucide-react";

export const EditRfqPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: rfq, isLoading, isError, error } = useRfq(id || "");
  const updateMutation = useUpdateRfq();

  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (values: CreateRfqInput) => {
    if (!id) return;
    setApiError(null);
    try {
      await updateMutation.mutateAsync({
        id,
        data: values,
      });
      navigate(`/buyer/rfqs/${id}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setApiError(err.message);
      } else {
        setApiError("Unable to update RFQ. Please check your connection and try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-lg p-16 text-center shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700">Loading RFQ for editing...</p>
      </div>
    );
  }

  if (isError || !rfq) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
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
              {(error as Error)?.message || "The requested RFQ could not be loaded."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If RFQ is CLOSED, prevent editing
  if (rfq.status === "CLOSED") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to={`/buyer/rfqs/${rfq.id}`}
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to RFQ Details
        </Link>

        <Card className="p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">This RFQ is CLOSED</h2>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Per marketplace business rules, closed RFQs cannot be modified or reopened.
          </p>
          <div className="mt-6">
            <Link to={`/buyer/rfqs/${rfq.id}`}>
              <Button variant="outline" size="sm">
                View RFQ Details
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center space-x-2">
        <Link
          to={`/buyer/rfqs/${rfq.id}`}
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to RFQ Details
        </Link>
      </div>

      {/* Card Form */}
      <Card className="p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Edit2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Edit RFQ
            </h1>
            <p className="text-xs text-slate-500">
              Update procurement specifications while the RFQ remains in OPEN status.
            </p>
          </div>
        </div>

        <RfqForm
          initialValues={{
            productName: rfq.productName,
            description: rfq.description,
            quantity: rfq.quantity,
            location: rfq.location,
            deadline: rfq.deadline,
          }}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
          submitLabel={updateMutation.isPending ? "Saving Changes..." : "Save Changes"}
          onCancel={() => navigate(`/buyer/rfqs/${rfq.id}`)}
          apiError={apiError}
        />
      </Card>
    </div>
  );
};

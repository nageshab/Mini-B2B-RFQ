import React, { useState, FormEvent } from "react";
import { CreateRfqInput } from "../../types/rfq";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { AlertCircle } from "lucide-react";

export interface RfqFormProps {
  initialValues?: Partial<CreateRfqInput>;
  onSubmit: (values: CreateRfqInput) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
  cancelPath?: string;
  onCancel?: () => void;
  apiError?: string | null;
}

export const RfqForm: React.FC<RfqFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  onCancel,
  apiError,
}) => {
  // Convert ISO string to format required by <input type="datetime-local"> (YYYY-MM-DDTHH:mm)
  const formatForDatetimeLocal = (isoString?: string): string => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const [productName, setProductName] = useState(
    initialValues?.productName || ""
  );
  const [description, setDescription] = useState(
    initialValues?.description || ""
  );
  const [quantity, setQuantity] = useState<string>(
    initialValues?.quantity !== undefined ? String(initialValues.quantity) : ""
  );
  const [location, setLocation] = useState(initialValues?.location || "");
  const [deadline, setDeadline] = useState(
    formatForDatetimeLocal(initialValues?.deadline)
  );

  const [fieldErrors, setFieldErrors] = useState<{
    productName?: string;
    description?: string;
    quantity?: string;
    location?: string;
    deadline?: string;
  }>({});

  // Minimum allowable date for deadline (now + 1 minute)
  const nowForInput = formatForDatetimeLocal(
    new Date(Date.now() + 60000).toISOString()
  );

  const validate = (): boolean => {
    const errors: {
      productName?: string;
      description?: string;
      quantity?: string;
      location?: string;
      deadline?: string;
    } = {};

    if (!productName.trim()) {
      errors.productName = "Product or service name is required";
    } else if (productName.trim().length < 2) {
      errors.productName = "Product name must be at least 2 characters";
    }

    if (!description.trim()) {
      errors.description = "Requirement description is required";
    } else if (description.trim().length < 5) {
      errors.description = "Description must be at least 5 characters";
    }

    const qtyNum = parseInt(quantity, 10);
    if (!quantity) {
      errors.quantity = "Quantity is required";
    } else if (isNaN(qtyNum) || qtyNum <= 0 || String(qtyNum) !== quantity.trim()) {
      errors.quantity = "Quantity must be a positive integer";
    }

    if (!location.trim()) {
      errors.location = "Delivery location is required";
    } else if (location.trim().length < 2) {
      errors.location = "Location must be at least 2 characters";
    }

    if (!deadline) {
      errors.deadline = "RFQ deadline is required";
    } else {
      const selectedDate = new Date(deadline);
      if (isNaN(selectedDate.getTime()) || selectedDate.getTime() <= Date.now()) {
        errors.deadline = "Deadline must be a future date and time";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      productName: productName.trim(),
      description: description.trim(),
      quantity: parseInt(quantity, 10),
      location: location.trim(),
      deadline: new Date(deadline).toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start space-x-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Product Name */}
      <Input
        label="Product / Service Name"
        type="text"
        id="productName"
        placeholder="e.g. Industrial Grade Centrifugal Water Pumps"
        value={productName}
        onChange={(e) => {
          setProductName(e.target.value);
          if (fieldErrors.productName) {
            setFieldErrors((prev) => ({ ...prev, productName: undefined }));
          }
        }}
        error={fieldErrors.productName}
        disabled={isSubmitting}
      />

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Requirement Description
        </label>
        <textarea
          id="description"
          rows={4}
          placeholder="Specify technical parameters, standards, material requirements, testing protocols, etc."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (fieldErrors.description) {
              setFieldErrors((prev) => ({ ...prev, description: undefined }));
            }
          }}
          disabled={isSubmitting}
          className={`w-full px-3 py-2 text-sm bg-white border rounded-md shadow-sm transition-colors
            placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0
            ${
              fieldErrors.description
                ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
            }
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
        />
        {fieldErrors.description && (
          <p className="mt-1 text-xs text-red-600">
            {fieldErrors.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Quantity */}
        <Input
          label="Quantity"
          type="number"
          id="quantity"
          min="1"
          step="1"
          placeholder="e.g. 50"
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            if (fieldErrors.quantity) {
              setFieldErrors((prev) => ({ ...prev, quantity: undefined }));
            }
          }}
          error={fieldErrors.quantity}
          disabled={isSubmitting}
        />

        {/* Location */}
        <Input
          label="Delivery Location"
          type="text"
          id="location"
          placeholder="e.g. Dallas, TX or Warehouse 4"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            if (fieldErrors.location) {
              setFieldErrors((prev) => ({ ...prev, location: undefined }));
            }
          }}
          error={fieldErrors.location}
          disabled={isSubmitting}
        />
      </div>

      {/* Deadline */}
      <div>
        <Input
          label="RFQ Bid Deadline"
          type="datetime-local"
          id="deadline"
          min={nowForInput}
          value={deadline}
          onChange={(e) => {
            setDeadline(e.target.value);
            if (fieldErrors.deadline) {
              setFieldErrors((prev) => ({ ...prev, deadline: undefined }));
            }
          }}
          error={fieldErrors.deadline}
          helperText="Suppliers cannot submit proposals after this timestamp."
          disabled={isSubmitting}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

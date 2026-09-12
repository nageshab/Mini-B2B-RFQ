import React, { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Role } from "../types/auth";
import { ApiClientError } from "../lib/api";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Building2, AlertCircle, ShoppingCart, Truck } from "lucide-react";

export const SignupPage: React.FC = () => {
  const { signup, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("BUYER");

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to the user's role dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = user.role === "BUYER" ? "/buyer" : "/supplier";
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const validate = (): boolean => {
    const errors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      errors.name = "Full name or company name is required";
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const createdUser = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      // Automatically logged in and token stored; navigate to appropriate dashboard
      const targetDashboard =
        createdUser.role === "BUYER" ? "/buyer" : "/supplier";
      navigate(targetDashboard, { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setGeneralError(err.message);
        if (err.errors && err.errors.length > 0) {
          const errors: { name?: string; email?: string; password?: string } =
            {};
          for (const item of err.errors) {
            if (item.path === "name") errors.name = item.message;
            if (item.path === "email") errors.email = item.message;
            if (item.path === "password") errors.password = item.message;
          }
          setFieldErrors((prev) => ({ ...prev, ...errors }));
        }
      } else {
        setGeneralError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-md mb-3">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Create an account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Join the Mini B2B RFQ Marketplace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="p-8 shadow-sm">
          {generalError && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2.5 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                I want to register as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("BUYER")}
                  className={`p-3.5 rounded-lg border text-left flex flex-col transition-all focus:outline-none ${
                    role === "BUYER"
                      ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <ShoppingCart
                      className={`w-4 h-4 ${
                        role === "BUYER" ? "text-blue-600" : "text-slate-400"
                      }`}
                    />
                    <span
                      className={`font-semibold text-sm ${
                        role === "BUYER" ? "text-blue-900" : "text-slate-800"
                      }`}
                    >
                      Buyer
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Post RFQs & receive quotations
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("SUPPLIER")}
                  className={`p-3.5 rounded-lg border text-left flex flex-col transition-all focus:outline-none ${
                    role === "SUPPLIER"
                      ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Truck
                      className={`w-4 h-4 ${
                        role === "SUPPLIER"
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    />
                    <span
                      className={`font-semibold text-sm ${
                        role === "SUPPLIER"
                          ? "text-emerald-900"
                          : "text-slate-800"
                      }`}
                    >
                      Supplier
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Browse RFQs & submit quotes
                  </span>
                </button>
              </div>
            </div>

            <Input
              label="Company or Full Name"
              type="text"
              id="name"
              placeholder="Acme Industrial Corp"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              error={fieldErrors.name}
              disabled={isSubmitting}
            />

            <Input
              label="Work Email"
              type="email"
              id="email"
              autoComplete="email"
              placeholder="procurement@acme.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              error={fieldErrors.email}
              disabled={isSubmitting}
            />

            <Input
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              helperText="Must be at least 8 characters long."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              error={fieldErrors.password}
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              className="w-full py-2.5 mt-2"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

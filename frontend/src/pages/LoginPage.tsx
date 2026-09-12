import React, { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ApiClientError } from "../lib/api";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Building2, AlertCircle } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
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
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
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
      const authenticatedUser = await login({
        email: email.trim(),
        password,
      });

      // Redirect to the user's role-specific dashboard
      const targetDashboard =
        authenticatedUser.role === "BUYER" ? "/buyer" : "/supplier";

      // If user was previously redirected to login from a protected page, honor it if matching role
      const from = (location.state as { from?: { pathname: string } })?.from
        ?.pathname;
      const destination =
        from && from.startsWith(targetDashboard) ? from : targetDashboard;

      navigate(destination, { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setGeneralError(err.message);
        if (err.errors && err.errors.length > 0) {
          const errors: { email?: string; password?: string } = {};
          for (const item of err.errors) {
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
          Sign in to your account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Mini B2B Request for Quotation Marketplace
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
            <Input
              label="Work Email"
              type="email"
              id="email"
              autoComplete="email"
              placeholder="you@company.com"
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
              autoComplete="current-password"
              placeholder="••••••••"
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
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Create account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

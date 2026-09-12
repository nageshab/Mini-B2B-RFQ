import React from "react";
import { Outlet, useNavigate, NavLink, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LogOut, Building2, User as UserIcon, PlusCircle } from "lucide-react";
import { Button } from "../components/ui/Button";

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <Link
              to={user?.role === "BUYER" ? "/buyer" : "/supplier"}
              className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-semibold text-slate-900 tracking-tight">
                  Mini B2B RFQ
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-normal text-slate-500 border-l border-slate-200 pl-2">
                  Marketplace Platform
                </span>
              </div>
            </Link>

            {/* Buyer Navigation Links */}
            {user?.role === "BUYER" && (
              <nav className="hidden sm:flex items-center space-x-1 pl-4 border-l border-slate-200 text-sm">
                <NavLink
                  to="/buyer"
                  end
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md font-medium transition-colors ${
                      isActive
                        ? "bg-slate-100 text-blue-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/buyer/rfqs"
                  end
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md font-medium transition-colors ${
                      isActive
                        ? "bg-slate-100 text-blue-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`
                  }
                >
                  My RFQs
                </NavLink>
                <NavLink
                  to="/buyer/rfqs/new"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md font-medium transition-colors inline-flex items-center ${
                      isActive
                        ? "bg-slate-100 text-blue-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`
                  }
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  Create RFQ
                </NavLink>
              </nav>
            )}

            {/* Supplier Navigation Links */}
            {user?.role === "SUPPLIER" && (
              <nav className="hidden sm:flex items-center space-x-1 pl-4 border-l border-slate-200 text-sm">
                <NavLink
                  to="/supplier"
                  end
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md font-medium transition-colors ${
                      isActive
                        ? "bg-slate-100 text-emerald-800 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/supplier/rfqs"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md font-medium transition-colors ${
                      isActive
                        ? "bg-slate-100 text-emerald-800 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`
                  }
                >
                  Browse RFQs
                </NavLink>
                <NavLink
                  to="/supplier/quotations"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md font-medium transition-colors ${
                      isActive
                        ? "bg-slate-100 text-emerald-800 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`
                  }
                >
                  My Quotations
                </NavLink>
              </nav>
            )}
          </div>

          {/* User Controls & Logout */}
          {user && (
            <div className="flex items-center space-x-4">
              {/* Role Badge */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${
                  user.role === "BUYER"
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {user.role}
              </span>

              {/* User Identity */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-slate-700">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-slate-900 text-xs leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-600 hover:border-red-200 text-xs"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Sign out
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto text-center text-xs text-slate-400">
        Mini B2B RFQ Marketplace &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Shared header/layout for every protected admin workspace page.
const AdminShell = ({ label = "Admin workspace", title, description, action, children }) => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <button onClick={() => navigate("/admin/dashboard")} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-black">
              <ArrowLeft size={17} /> Admin dashboard
            </button>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-500">{label}</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">{title}</h1>
            {description && <p className="mt-2 max-w-2xl text-slate-600">{description}</p>}
          </div>
          {action}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
};

export default AdminShell;

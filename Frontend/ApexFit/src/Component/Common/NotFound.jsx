import React from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "./EmptyState";

// Friendly fallback for routes that do not exist.
const NotFound = () => {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 text-center">
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-red-500/20">
        <p className="text-7xl font-black text-[#27253F]">404</p>
        <EmptyState message="We couldn't find that page. It may have moved or never existed." />
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={() => navigate(-1)} className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-black px-5 py-3 font-semibold transition hover:bg-black hover:text-white"><ArrowLeft size={18} /> Go back</button>
          <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white shadow-lg shadow-red-500/30"><Home size={18} /> Home</Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;

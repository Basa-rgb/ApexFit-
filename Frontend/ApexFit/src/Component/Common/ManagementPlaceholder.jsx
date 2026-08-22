import React from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "./EmptyState";

const labels = {
  users: "Users",
  subscriptions: "Subscriptions",
  bookings: "Bookings",
  "booking-options": "Booking Options",
  payments: "Payments",
  blogs: "Blogs",
  contacts: "Contacts",
};

// Safe admin landing state until the matching CRUD workspace is added.
const ManagementPlaceholder = () => {
  const navigate = useNavigate();
  const { section } = useParams();
  const title = labels[section] || "Admin section";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-red-500/20">
        <ShieldCheck className="mx-auto text-red-500" size={40} />
        <h1 className="mt-4 text-3xl font-bold text-slate-900">{title}</h1>
        <EmptyState message={`The protected ${title.toLowerCase()} workspace is ready for your management tools.`} />
        <button onClick={() => navigate("/admin/dashboard")} className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-black px-5 py-3 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-transparent hover:text-black"><ArrowLeft size={18} /> Back to admin dashboard</button>
      </div>
    </main>
  );
};

export default ManagementPlaceholder;

import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import AdminShell from "../../Common/AdminShell";
import EmptyState from "../../Common/EmptyState";
import Loader from "../../Common/Loader";
import { deletePayment, getAllPayments, updatePayment } from "../../../api/payment.api";

const statusStyles = {
  Completed: "bg-green-50 text-green-700",
  Pending: "bg-amber-50 text-amber-700",
  Failed: "bg-red-50 text-red-700",
};

// Protected admin workspace: review every payment and its status.
const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = await getAllPayments();
      setPayments(response.data?.payments || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (payment, status) => {
    try {
      await updatePayment(payment._id, { status });
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not update payment.");
    }
  };

  const remove = async (payment) => {
    if (!window.confirm("Delete this payment record permanently? This cannot be undone.")) return;
    try {
      await deletePayment(payment._id);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete payment.");
    }
  };

  return (
    <AdminShell title="Payments" description="Track successful, pending, and failed payments across the gym.">
      {loading ? (
        <div className="flex justify-center py-16"><Loader /></div>
      ) : (
        <>
          {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-lg shadow-red-500/15">
            <table className="w-full min-w-[800px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
                <tr><th className="p-5">Member</th><th className="p-5">Amount</th><th className="p-5">Method</th><th className="p-5">Transaction</th><th className="p-5">Date</th><th className="p-5">Status</th><th className="p-5">Actions</th></tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-slate-100 last:border-0">
                    <td className="p-5"><p className="font-bold text-slate-900">{payment.userId?.name || "Unknown"}</p><p className="text-sm text-slate-500">{payment.userId?.email}</p></td>
                    <td className="p-5 font-bold text-slate-900">Rs. {(payment.amount || 0).toLocaleString()}</td>
                    <td className="p-5 text-slate-600">{payment.paymentMethod}</td>
                    <td className="p-5 max-w-40 truncate text-xs text-slate-400">{payment.transactionCode || payment.transactionUuid || "\u2014"}</td>
                    <td className="p-5 text-slate-600">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td className="p-5"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[payment.status] || "bg-slate-100 text-slate-600"}`}>{payment.status}</span></td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <select value={payment.status} onChange={(event) => changeStatus(payment, event.target.value)} aria-label={`Change payment ${payment._id} status`} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
                          <option>Pending</option><option>Completed</option><option>Failed</option>
                        </select>
                        <button onClick={() => remove(payment)} aria-label="Delete payment" className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!payments.length && <EmptyState message="No payments found yet." />}
          </div>
        </>
      )}
    </AdminShell>
  );
};

export default AdminPayments;

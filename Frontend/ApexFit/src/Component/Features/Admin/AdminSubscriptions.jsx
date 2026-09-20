import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import AdminShell from "../../Common/AdminShell";
import EmptyState from "../../Common/EmptyState";
import Loader from "../../Common/Loader";
import { deleteSubscription, getAllSubscriptions, updateSubscription } from "../../../api/subscription.api";

const statusStyles = {
  Active: "bg-green-50 text-green-700",
  Pending: "bg-amber-50 text-amber-700",
  Expired: "bg-slate-100 text-slate-600",
  Cancelled: "bg-red-50 text-red-700",
};

// Protected admin workspace: review and manage membership subscriptions.
const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = await getAllSubscriptions();
      setSubscriptions(response.data?.subscriptions || response.data?.data || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (subscription, status) => {
    try {
      await updateSubscription(subscription._id, { status });
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not update subscription.");
    }
  };

  const remove = async (subscription) => {
    if (!window.confirm("Delete this subscription permanently? This cannot be undone.")) return;
    try {
      await deleteSubscription(subscription._id);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete subscription.");
    }
  };

  return (
    <AdminShell title="Subscriptions" description="Activate, expire, or cancel member subscriptions.">
      {loading ? (
        <div className="flex justify-center py-16"><Loader /></div>
      ) : (
        <>
          {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-lg shadow-red-500/15">
            <table className="w-full min-w-[820px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
                <tr><th className="p-5">Member</th><th className="p-5">Plan</th><th className="p-5">Period</th><th className="p-5">Status</th><th className="p-5">Actions</th></tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription._id} className="border-b border-slate-100 last:border-0">
                    <td className="p-5"><p className="font-bold text-slate-900">{subscription.userId?.name || "Unknown"}</p><p className="text-sm text-slate-500">{subscription.userId?.email}</p></td>
                    <td className="p-5 text-slate-600">
                      {subscription.membershipPlanId?.name || "—"}
                      {subscription.membershipPlanId?.price !== undefined && (
                        <span className="block text-sm text-slate-400">Rs. {(subscription.membershipPlanId.price || 0).toLocaleString()} / {subscription.membershipPlanId.duration} mo</span>
                      )}
                    </td>
                    <td className="p-5 text-sm text-slate-600">
                      {new Date(subscription.startDate).toLocaleDateString()} →<br />{new Date(subscription.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-5"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[subscription.status] || "bg-slate-100 text-slate-600"}`}>{subscription.status}</span></td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <select value={subscription.status} onChange={(event) => changeStatus(subscription, event.target.value)} aria-label={`Change subscription ${subscription._id} status`} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
                          <option>Pending</option><option>Active</option><option>Expired</option><option>Cancelled</option>
                        </select>
                        <button onClick={() => remove(subscription)} aria-label="Delete subscription" className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!subscriptions.length && <EmptyState message="No subscriptions found yet." />}
          </div>
        </>
      )}
    </AdminShell>
  );
};

export default AdminSubscriptions;

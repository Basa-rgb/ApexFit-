import React, { useEffect, useState } from "react";
import { Mail, Trash2 } from "lucide-react";
import AdminShell from "../../Common/AdminShell";
import EmptyState from "../../Common/EmptyState";
import Loader from "../../Common/Loader";
import { deleteSubscriber, getAllSubscribers } from "../../../api/newsletter.api";

// Protected admin workspace: view and remove newsletter subscribers.
const AdminNewsletters = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = await getAllSubscribers();
      setSubscribers(response.data?.subscribers || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load subscribers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (subscriber) => {
    if (!window.confirm(`Remove ${subscriber.email} from the newsletter?`)) return;
    try {
      await deleteSubscriber(subscriber._id);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not remove the subscriber.");
    }
  };

  return (
    <AdminShell title="Newsletter" description="Everyone subscribed to fitness tips and offers.">
      {loading ? (
        <div className="flex justify-center py-16"><Loader /></div>
      ) : (
        <>
          {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-bold text-slate-600">
            <Mail size={15} /> {subscribers.length} subscriber{subscribers.length === 1 ? "" : "s"}
          </p>
          <div className="space-y-3">
            {subscribers.map((subscriber) => (
              <article key={subscriber._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-red-500/10">
                <div>
                  <p className="font-bold text-slate-900">{subscriber.name}</p>
                  <p className="text-sm text-slate-500">{subscriber.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">Subscribed</span>
                  <button onClick={() => remove(subscriber)} aria-label={`Remove ${subscriber.email}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                </div>
              </article>
            ))}
          </div>
          {!subscribers.length && <EmptyState message="No newsletter subscribers yet." />}
        </>
      )}
    </AdminShell>
  );
};

export default AdminNewsletters;

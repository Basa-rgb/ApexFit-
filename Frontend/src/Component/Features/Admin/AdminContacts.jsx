import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import AdminShell from "../../Common/AdminShell";
import EmptyState from "../../Common/EmptyState";
import Loader from "../../Common/Loader";
import { deleteContact, getAllContacts, updateContact } from "../../../api/contact.api";

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Replied: "bg-green-50 text-green-700",
};

// Protected admin workspace: read and resolve contact messages.
const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = await getAllContacts();
      setContacts(response.data?.contacts || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markReplied = async (contact) => {
    try {
      await updateContact(contact._id, { status: "Replied" });
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not update the message.");
    }
  };

  const remove = async (contact) => {
    if (!window.confirm(`Delete the message from ${contact.name}? This cannot be undone.`)) return;
    try {
      await deleteContact(contact._id);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete the message.");
    }
  };

  return (
    <AdminShell title="Contacts" description="Messages sent through the public contact form.">
      {loading ? (
        <div className="flex justify-center py-16"><Loader /></div>
      ) : (
        <>
          {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
          <div className="space-y-3">
            {contacts.map((contact) => (
              <article key={contact._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-red-500/10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">{contact.name}</p>
                    <p className="text-sm text-slate-500">{contact.email} · {contact.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[contact.status] || "bg-slate-100 text-slate-600"}`}>{contact.status}</span>
                    {contact.status !== "Replied" && (
                      <button onClick={() => markReplied(contact)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-black hover:text-black">
                        Mark replied
                      </button>
                    )}
                    <button onClick={() => remove(contact)} aria-label="Delete message" className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                  </div>
                </div>
                <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{contact.message}</p>
                <p className="mt-2 text-xs text-slate-400">{new Date(contact.createdAt).toLocaleString()}</p>
              </article>
            ))}
          </div>
          {!contacts.length && <EmptyState message="No contact messages yet." />}
        </>
      )}
    </AdminShell>
  );
};

export default AdminContacts;

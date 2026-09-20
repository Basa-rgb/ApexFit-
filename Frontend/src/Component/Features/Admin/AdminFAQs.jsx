import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import AdminShell from "../../Common/AdminShell";
import EmptyState from "../../Common/EmptyState";
import Loader from "../../Common/Loader";
import { createFAQ, deleteFAQ, getAllFAQsAdmin, updateFAQ } from "../../../api/faq.api";

const EMPTY_FORM = { question: "", answer: "", order: 0 };

// Protected admin workspace: manage the public FAQ list.
const AdminFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const response = await getAllFAQsAdmin();
      setFaqs(response.data?.faqs || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load FAQs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (faq) => {
    setEditingId(faq._id);
    setForm({ question: faq.question, answer: faq.answer, order: faq.order || 0 });
    setShowForm(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) await updateFAQ(editingId, form);
      else await createFAQ(form);
      setShowForm(false);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save the FAQ.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (faq) => {
    if (!window.confirm("Delete this FAQ? This cannot be undone.")) return;
    try {
      await deleteFAQ(faq._id);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete the FAQ.");
    }
  };

  return (
    <AdminShell
      title="FAQs"
      description="Questions shown on the public contact page."
      action={
        <button onClick={openCreate} className="inline-flex items-center gap-2 self-start rounded-xl border-2 border-black bg-black px-4 py-3 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-transparent hover:text-black">
          <Plus size={18} /> Add FAQ
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-16"><Loader /></div>
      ) : (
        <>
          {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
          <div className="space-y-3">
            {faqs.map((faq) => (
              <article key={faq._id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-red-500/10">
                <div>
                  <p className="font-bold text-slate-900">{faq.question}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{faq.answer}</p>
                  {!faq.isActive && <span className="mt-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Hidden</span>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => openEdit(faq)} aria-label="Edit FAQ" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Pencil size={17} /></button>
                  <button onClick={() => remove(faq)} aria-label="Delete FAQ" className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                </div>
              </article>
            ))}
          </div>
          {!faqs.length && <EmptyState message="No FAQs yet. Add the first question." />}
        </>
      )}

      {/* Add/edit FAQ modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <form onSubmit={submit} className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl shadow-red-500/30">
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close form" className="absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-slate-900">{editingId ? "Edit FAQ" : "Add an FAQ"}</h2>
            <div className="mt-6 space-y-4">
              <input required value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} placeholder="Question" className="w-full rounded-xl border p-3" />
              <textarea required value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} rows="4" placeholder="Answer" className="w-full resize-none rounded-xl border p-3" />
              <input type="number" min="0" value={form.order} onChange={(event) => setForm({ ...form, order: Number(event.target.value) })} placeholder="Display order" className="w-full rounded-xl border p-3" />
            </div>
            <button disabled={saving} className="mt-6 w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60">Save</button>
          </form>
        </div>
      )}
    </AdminShell>
  );
};

export default AdminFAQs;

import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import AdminShell from "../../Common/AdminShell";
import EmptyState from "../../Common/EmptyState";
import Loader from "../../Common/Loader";
import {
  createMembershipPlan,
  deleteMembershipPlan,
  getAllMembershipPlans,
  updateMembershipPlan,
} from "../../../api/membership.api";

const EMPTY_FORM = {
  name: "",
  planType: "Basic",
  description: "",
  duration: 1,
  price: 0,
  featuresInput: "",
};

// Protected admin workspace: manage membership/subscription plans.
const AdminMembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const response = await getAllMembershipPlans();
      setPlans(response.data?.plans || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load plans.");
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

  const openEdit = (plan) => {
    setEditingId(plan._id);
    setForm({
      name: plan.name,
      planType: plan.planType,
      description: plan.description,
      duration: plan.duration,
      price: plan.price,
      featuresInput: (plan.features || []).join("\n"),
    });
    setShowForm(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        planType: form.planType,
        description: form.description,
        duration: Number(form.duration),
        price: Number(form.price),
        features: form.featuresInput.split("\n").map((line) => line.trim()).filter(Boolean),
        isActive: true,
      };
      if (editingId) await updateMembershipPlan(editingId, payload);
      else await createMembershipPlan(payload);
      setShowForm(false);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save the plan.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (plan) => {
    if (!window.confirm(`Delete the "${plan.name}" plan? This cannot be undone.`)) return;
    try {
      await deleteMembershipPlan(plan._id);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete the plan.");
    }
  };

  return (
    <AdminShell
      title="Membership plans"
      description="Create and tune the subscription plans members can buy."
      action={
        <button onClick={openCreate} className="inline-flex items-center gap-2 self-start rounded-xl border-2 border-black bg-black px-4 py-3 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-transparent hover:text-black">
          <Plus size={18} /> Add plan
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-16"><Loader /></div>
      ) : (
        <>
          {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan._id} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-red-500/15">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">{plan.planType}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(plan)} aria-label={`Edit ${plan.name}`} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Pencil size={17} /></button>
                    <button onClick={() => remove(plan)} aria-label={`Delete ${plan.name}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                  </div>
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">{plan.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
                <p className="mt-4 text-2xl font-bold text-slate-900">Rs. {(plan.price || 0).toLocaleString()}<span className="text-sm font-medium text-slate-500"> / {plan.duration} mo</span></p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {(plan.features || []).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" /> {feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          {!plans.length && <EmptyState message="No membership plans yet. Add your first plan." />}
        </>
      )}

      {/* Add/edit plan modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-10">
          <form onSubmit={submit} className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl shadow-red-500/30">
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close form" className="absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-slate-900">{editingId ? "Edit plan" : "Add a membership plan"}</h2>
            <div className="mt-6 space-y-4">
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Plan name" className="w-full rounded-xl border p-3" />
              <div className="grid grid-cols-2 gap-4">
                <select value={form.planType} onChange={(event) => setForm({ ...form, planType: event.target.value })} className="rounded-xl border p-3">
                  <option>Basic</option><option>Standard</option><option>Premium</option><option>VIP</option>
                </select>
                <input required type="number" min="1" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} placeholder="Duration (months)" className="rounded-xl border p-3" />
              </div>
              <input required type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="Price (Rs.)" className="w-full rounded-xl border p-3" />
              <textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="3" placeholder="Short description" className="w-full resize-none rounded-xl border p-3" />
              <textarea value={form.featuresInput} onChange={(event) => setForm({ ...form, featuresInput: event.target.value })} rows="4" placeholder={"One feature per line, e.g.\nUnlimited gym access\nFree diet consultation"} className="w-full resize-none rounded-xl border p-3" />
            </div>
            <button disabled={saving} className="mt-6 w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
              {editingId ? "Save changes" : "Create plan"}
            </button>
          </form>
        </div>
      )}
    </AdminShell>
  );
};

export default AdminMembershipPlans;

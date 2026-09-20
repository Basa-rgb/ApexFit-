import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import AdminShell from "../../Common/AdminShell";
import EmptyState from "../../Common/EmptyState";
import Loader from "../../Common/Loader";
import {
  createWorkout,
  deleteWorkout,
  getAllWorkouts,
  updateWorkout,
} from "../../../api/workout.api";
import { getAdminUsers } from "../../../api/admin.api";
import { getAllTrainers } from "../../../api/trainer.api";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

const EMPTY_FORM = {
  userId: "",
  trainerId: "",
  title: "",
  goal: "",
  difficulty: "Beginner",
  duration: "4 weeks",
  daysPerWeek: 3,
  exercisesInput: "",
};

// Protected admin workspace: assign workout plans to members.
const AdminWorkoutPlans = () => {
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [plansRes, usersRes, trainersRes] = await Promise.all([
        getAllWorkouts(),
        getAdminUsers(),
        getAllTrainers(),
      ]);
      setPlans(plansRes.data?.workoutPlans || []);
      setUsers(usersRes.data?.users || []);
      setTrainers(trainersRes.data?.trainer || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load workout plans.");
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
      userId: plan.userId?._id || "",
      trainerId: plan.trainerId?._id || "",
      title: plan.title || "",
      goal: plan.goal || "",
      difficulty: plan.difficulty || "Beginner",
      duration: plan.duration || "",
      daysPerWeek: plan.daysPerWeek || 3,
      exercisesInput: (plan.exercises || [])
        .map((exercise) => `${exercise.name} | ${exercise.sets ?? ""} | ${exercise.reps ?? ""}`)
        .join("\n"),
    });
    setShowForm(true);
  };

  const parseExercises = () =>
    form.exercisesInput
      .split("\n")
      .map((line) => line.split("|").map((part) => part.trim()))
      .filter(([name]) => name)
      .map(([name, sets, reps]) => ({ name, sets, reps }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        userId: form.userId,
        trainerId: form.trainerId,
        title: form.title,
        goal: form.goal,
        difficulty: form.difficulty,
        duration: form.duration,
        daysPerWeek: Number(form.daysPerWeek) || undefined,
        exercises: parseExercises(),
      };
      if (editingId) await updateWorkout(editingId, payload);
      else await createWorkout(payload);
      setShowForm(false);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save the workout plan.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (plan) => {
    if (!window.confirm(`Delete "${plan.title}"? This cannot be undone.`)) return;
    try {
      await deleteWorkout(plan._id);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete the workout plan.");
    }
  };

  return (
    <AdminShell
      title="Workout plans"
      description="Create training plans and assign them to members."
      action={
        <button onClick={openCreate} className="inline-flex items-center gap-2 self-start rounded-xl border-2 border-black bg-black px-4 py-3 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-transparent hover:text-black">
          <Plus size={18} /> New plan
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-16"><Loader /></div>
      ) : (
        <>
          {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-lg shadow-red-500/15">
            <table className="w-full min-w-[820px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
                <tr><th className="p-5">Plan</th><th className="p-5">Member</th><th className="p-5">Trainer</th><th className="p-5">Goal</th><th className="p-5">Level</th><th className="p-5">Actions</th></tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan._id} className="border-b border-slate-100 last:border-0">
                    <td className="p-5 font-bold text-slate-900">{plan.title}<br /><span className="text-sm font-normal text-slate-400">{(plan.exercises || []).length} exercises · {plan.duration}</span></td>
                    <td className="p-5 text-slate-600">{plan.userId?.name || "—"}</td>
                    <td className="p-5 text-slate-600">{plan.trainerId?.fullName || "—"}</td>
                    <td className="p-5"><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">{plan.goal || "—"}</span></td>
                    <td className="p-5"><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{plan.difficulty || "—"}</span></td>
                    <td className="p-5">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(plan)} aria-label={`Edit ${plan.title}`} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Pencil size={17} /></button>
                        <button onClick={() => remove(plan)} aria-label={`Delete ${plan.title}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!plans.length && <EmptyState message="No workout plans yet. Create the first one." />}
          </div>
        </>
      )}

      {/* Add/edit plan modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-10">
          <form onSubmit={submit} className="relative w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl shadow-red-500/30">
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close form" className="absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-slate-900">{editingId ? "Edit workout plan" : "New workout plan"}</h2>
            <div className="mt-6 space-y-4">
              <select required value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })} className="w-full rounded-xl border p-3" disabled={Boolean(editingId)}>
                <option value="">Select member…</option>
                {users.map((user) => <option key={user._id} value={user._id}>{user.name} ({user.email})</option>)}
              </select>
              <select required value={form.trainerId} onChange={(event) => setForm({ ...form, trainerId: event.target.value })} className="w-full rounded-xl border p-3">
                <option value="">Select trainer…</option>
                {trainers.map((trainer) => <option key={trainer._id} value={trainer._id}>{trainer.fullName}</option>)}
              </select>
              <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Plan title" className="w-full rounded-xl border p-3" />
              <div className="grid grid-cols-2 gap-4">
                <input value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} placeholder="Goal e.g. Muscle Gain" className="rounded-xl border p-3" />
                <input required value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} placeholder="Duration e.g. 4 weeks" className="rounded-xl border p-3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value })} className="rounded-xl border p-3">
                  {DIFFICULTIES.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
                </select>
                <input type="number" min="1" max="7" value={form.daysPerWeek} onChange={(event) => setForm({ ...form, daysPerWeek: event.target.value })} placeholder="Days per week" className="rounded-xl border p-3" />
              </div>
              <textarea required value={form.exercisesInput} onChange={(event) => setForm({ ...form, exercisesInput: event.target.value })} rows="6" placeholder={"One exercise per line:  Name | Sets | Reps\ne.g.\nBench Press | 4 | 10\nSquats | 4 | 12"} className="w-full resize-none rounded-xl border p-3" />
            </div>
            <button disabled={saving} className="mt-6 w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60">Save plan</button>
          </form>
        </div>
      )}
    </AdminShell>
  );
};

export default AdminWorkoutPlans;

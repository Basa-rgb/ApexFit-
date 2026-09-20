import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, UserRound, X } from "lucide-react";
import AdminShell from "../../Common/AdminShell";
import EmptyState from "../../Common/EmptyState";
import Loader from "../../Common/Loader";
import {
  createTrainer,
  deleteTrainer,
  getAllTrainers,
  updateTrainer,
} from "../../../api/trainer.api";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  gender: "Male",
  bio: "",
  specialization: "",
  experience: 0,
  certifications: "",
  monthlyFee: 0,
  personalTrainingFee: 0,
  facebook: "",
  instagram: "",
  linkedin: "",
};

// Protected admin workspace: add, edit, and remove trainers.
const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [availableDays, setAvailableDays] = useState([]);
  const [availableTime, setAvailableTime] = useState({ start: "06:00 AM", end: "08:00 PM" });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    try {
      const response = await getAllTrainers();
      setTrainers(response.data?.trainer || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load trainers.");
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
    setAvailableDays([]);
    setAvailableTime({ start: "06:00 AM", end: "08:00 PM" });
    setImageFile(null);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (trainer) => {
    setEditingId(trainer._id);
    setForm({
      fullName: trainer.fullName || "",
      email: trainer.email || "",
      phone: trainer.phone || "",
      gender: trainer.gender || "Male",
      bio: trainer.bio || "",
      specialization: (trainer.specialization || []).join(", "),
      experience: trainer.experience || 0,
      certifications: (trainer.certifications || []).join(", "),
      monthlyFee: trainer.monthlyFee || 0,
      personalTrainingFee: trainer.personalTrainingFee || 0,
      facebook: trainer.socialLinks?.facebook || "",
      instagram: trainer.socialLinks?.instagram || "",
      linkedin: trainer.socialLinks?.linkedin || "",
    });
    setAvailableDays(trainer.availableDays || []);
    setAvailableTime(trainer.availableTime || { start: "", end: "" });
    setImageFile(null);
    setFormError("");
    setShowForm(true);
  };

  const buildPayload = () => {
    const payload = new FormData();
    payload.append("fullName", form.fullName);
    payload.append("email", form.email);
    payload.append("phone", form.phone);
    payload.append("gender", form.gender);
    payload.append("bio", form.bio);
    payload.append("specialization", JSON.stringify(form.specialization.split(",").map((item) => item.trim()).filter(Boolean)));
    payload.append("experience", Number(form.experience) || 0);
    payload.append("certifications", JSON.stringify(form.certifications.split(",").map((item) => item.trim()).filter(Boolean)));
    payload.append("availableDays", JSON.stringify(availableDays));
    payload.append("availableTime", JSON.stringify(availableTime));
    payload.append("monthlyFee", Number(form.monthlyFee) || 0);
    payload.append("personalTrainingFee", Number(form.personalTrainingFee) || 0);
    if (form.facebook) payload.append("facebook", form.facebook);
    if (form.instagram) payload.append("instagram", form.instagram);
    if (form.linkedin) payload.append("linkedin", form.linkedin);
    if (imageFile) payload.append("image", imageFile);
    return payload;
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editingId) await updateTrainer(editingId, buildPayload());
      else await createTrainer(buildPayload());
      setError("");
      setShowForm(false);
      load();
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Could not save the trainer.";
      const friendly =
        requestError.response?.status === 409
          ? "A trainer with this email already exists. Close this form and use the edit (pencil) button on their row instead."
          : message;
      setFormError(friendly);
      setError(friendly);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (trainer) => {
    if (!window.confirm(`Delete trainer ${trainer.fullName}? This cannot be undone.`)) return;
    try {
      await deleteTrainer(trainer._id);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete the trainer.");
    }
  };

  const toggleDay = (day) =>
    setAvailableDays((days) => (days.includes(day) ? days.filter((item) => item !== day) : [...days, day]));

  return (
    <AdminShell
      title="Trainers"
      description="Add new coaches, keep their availability current, and remove trainers who leave."
      action={
        <button onClick={openCreate} className="inline-flex items-center gap-2 self-start rounded-xl border-2 border-black bg-black px-4 py-3 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-transparent hover:text-black">
          <Plus size={18} /> Add trainer
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-16"><Loader /></div>
      ) : (
        <>
          {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-lg shadow-red-500/15">
            <table className="w-full min-w-[720px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
                <tr><th className="p-5">Trainer</th><th className="p-5">Specialization</th><th className="p-5">Availability</th><th className="p-5">Fees</th><th className="p-5">Actions</th></tr>
              </thead>
              <tbody>
                {trainers.map((trainer) => (
                  <tr key={trainer._id} className="border-b border-slate-100 last:border-0">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        {trainer.profileImage ? (
                          <img src={trainer.profileImage} alt={trainer.fullName} className="h-11 w-11 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100"><UserRound size={20} className="text-slate-400" /></span>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{trainer.fullName}</p>
                          <p className="text-sm text-slate-500">{trainer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-sm text-slate-600">{(trainer.specialization || []).join(", ") || "—"}</td>
                    <td className="p-5 text-sm text-slate-600">{(trainer.availableDays || []).join(", ") || "—"}<br />{trainer.availableTime?.start} – {trainer.availableTime?.end}</td>
                    <td className="p-5 text-sm text-slate-600">Rs. {(trainer.monthlyFee || 0).toLocaleString()}<br />Rs. {(trainer.personalTrainingFee || 0).toLocaleString()}</td>
                    <td className="p-5">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(trainer)} aria-label={`Edit ${trainer.fullName}`} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Pencil size={17} /></button>
                        <button onClick={() => remove(trainer)} aria-label={`Delete ${trainer.fullName}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!trainers.length && <EmptyState message="No trainers yet. Add your first coach." />}
          </div>
        </>
      )}

      {/* Add/edit trainer modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-10">
          <form onSubmit={submit} className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl shadow-red-500/30">
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close form" className="absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-slate-900">{editingId ? "Edit trainer" : "Add a new trainer"}</h2>

            {formError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{formError}</p>}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Full name" className="rounded-xl border p-3" />
              <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" className="rounded-xl border p-3" />
              <input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Phone" className="rounded-xl border p-3" />
              <select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} className="rounded-xl border p-3">
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
              <input type="number" min="0" value={form.experience} onChange={(event) => setForm({ ...form, experience: event.target.value })} placeholder="Experience (years)" className="rounded-xl border p-3" />
              <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} className="rounded-xl border p-3 file:mr-3 file:rounded-lg file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-white" />
            </div>

            <textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} rows="3" placeholder="Short bio" className="mt-4 w-full resize-none rounded-xl border p-3" />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input value={form.specialization} onChange={(event) => setForm({ ...form, specialization: event.target.value })} placeholder="Specialization (comma separated)" className="rounded-xl border p-3" />
              <input value={form.certifications} onChange={(event) => setForm({ ...form, certifications: event.target.value })} placeholder="Certifications (comma separated)" className="rounded-xl border p-3" />
              <input type="number" min="0" value={form.monthlyFee} onChange={(event) => setForm({ ...form, monthlyFee: event.target.value })} placeholder="Monthly fee" className="rounded-xl border p-3" />
              <input type="number" min="0" value={form.personalTrainingFee} onChange={(event) => setForm({ ...form, personalTrainingFee: event.target.value })} placeholder="Personal training fee" className="rounded-xl border p-3" />
            </div>

            <fieldset className="mt-4">
              <legend className="text-sm font-semibold text-slate-700">Available days</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button key={day} type="button" onClick={() => toggleDay(day)} className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${availableDays.includes(day) ? "border-black bg-black text-white" : "border-slate-300 text-slate-600 hover:border-black"}`}>
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">Available from
                <input value={availableTime.start} onChange={(event) => setAvailableTime({ ...availableTime, start: event.target.value })} placeholder="e.g. 06:00 AM" className="mt-1 w-full rounded-xl border p-3 font-normal" />
              </label>
              <label className="text-sm font-semibold text-slate-700">Available until
                <input value={availableTime.end} onChange={(event) => setAvailableTime({ ...availableTime, end: event.target.value })} placeholder="e.g. 08:00 PM" className="mt-1 w-full rounded-xl border p-3 font-normal" />
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <input value={form.facebook} onChange={(event) => setForm({ ...form, facebook: event.target.value })} placeholder="Facebook URL" className="rounded-xl border p-3" />
              <input value={form.instagram} onChange={(event) => setForm({ ...form, instagram: event.target.value })} placeholder="Instagram URL" className="rounded-xl border p-3" />
              <input value={form.linkedin} onChange={(event) => setForm({ ...form, linkedin: event.target.value })} placeholder="LinkedIn URL" className="rounded-xl border p-3" />
            </div>

            <button disabled={saving} className="mt-6 w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
              {saving ? "Saving…" : editingId ? "Save changes" : "Create trainer"}
            </button>
          </form>
        </div>
      )}
    </AdminShell>
  );
};

export default AdminTrainers;

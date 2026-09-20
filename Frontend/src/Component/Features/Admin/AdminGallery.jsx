import React, { useEffect, useState } from "react";
import { Maximize2, Plus, Trash2, X } from "lucide-react";
import AdminShell from "../../Common/AdminShell";
import EmptyState from "../../Common/EmptyState";
import Loader from "../../Common/Loader";
import { createGallery, deleteGallery, getAllGallery } from "../../../api/gallery.api";

const CATEGORIES = ["Gym", "Workout", "Equipment", "Events", "Transformation", "Training", "Others"];

// Protected admin workspace: upload gallery images (stored on Cloudinary).
const AdminGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Gym", date: "" });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    try {
      const response = await getAllGallery();
      setItems(response.data?.galleries || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load the gallery.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!imageFile) return;
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("category", form.category);
      payload.append("date", form.date);
      payload.append("image", imageFile);
      await createGallery(payload);
      setShowForm(false);
      setForm({ title: "", category: "Gym", date: "" });
      setImageFile(null);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not upload the image.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.title}" from the gallery?`)) return;
    try {
      await deleteGallery(item._id);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete the image.");
    }
  };

  return (
    <AdminShell
      title="Gallery"
      description="Upload gym photos — images are stored on Cloudinary and shown on the public gallery page."
      action={
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 self-start rounded-xl border-2 border-black bg-black px-4 py-3 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-transparent hover:text-black">
          <Plus size={18} /> Upload photo
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-16"><Loader /></div>
      ) : (
        <>
          {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <article key={item._id} className="group relative h-64 overflow-hidden rounded-3xl bg-slate-200 shadow-lg shadow-red-500/15">
                <button type="button" onClick={() => setSelected(item)} aria-label={`View ${item.title}`} className="block h-full w-full cursor-zoom-in text-left">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute right-3 top-14 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white opacity-0 backdrop-blur transition group-hover:opacity-100"><Maximize2 size={13} /> View</span>
                </button>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-4 pt-14 text-white">
                  <p className="font-bold">{item.title}</p>
                  <p className="text-xs text-slate-200">{item.category}</p>
                </div>
                <button onClick={() => remove(item)} aria-label={`Delete ${item.title}`} className="absolute right-3 top-3 rounded-full bg-white p-2 text-red-600 opacity-0 transition group-hover:opacity-100">
                  <Trash2 size={16} />
                </button>
              </article>
            ))}
          </div>
          {!items.length && <EmptyState message="No gallery images yet. Upload the first one." />}
        </>
      )}

      {/* Full-size image viewer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" onClick={() => setSelected(null)}>
          <div className="relative max-h-[90vh] max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <button onClick={() => setSelected(null)} aria-label="Close image" className="absolute -top-12 right-0 rounded-full bg-white p-2 text-black transition hover:bg-slate-200 sm:-right-4 sm:-top-4"><X size={20} /></button>
            <img src={selected.image} alt={selected.title} className="max-h-[85vh] rounded-2xl object-contain" />
            <div className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-linear-to-t from-black/75 to-transparent p-4 pt-10 text-white">
              <p className="font-bold">{selected.title}</p>
              {selected.category && <p className="text-sm text-slate-300">{selected.category}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Upload modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <form onSubmit={submit} className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-red-500/30">
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close form" className="absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-slate-900">Upload a photo</h2>
            <div className="mt-6 space-y-4">
              <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Photo title" className="w-full rounded-xl border p-3" />
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-xl border p-3">
                {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
              <input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="w-full rounded-xl border p-3" />
              <input required type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} className="w-full rounded-xl border p-3 file:mr-3 file:rounded-lg file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-white" />
            </div>
            <button disabled={saving} className="mt-6 w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
              Upload to Cloudinary
            </button>
          </form>
        </div>
      )}
    </AdminShell>
  );
};

export default AdminGallery;

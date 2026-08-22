import React, { useEffect, useState } from "react";
import { Maximize2, X } from "lucide-react";
import { getAllGallery } from "../../../api/gallery.api";
import EmptyState from "../../Common/EmptyState";
import Loader from "../../Common/Loader";

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load gallery entries from the public backend API.
    getAllGallery().then((response) => setItems(response.data?.gallery || response.data?.galleries || [])).catch((requestError) => setError(requestError.response?.data?.message || "Could not load the gallery.")).finally(() => setLoading(false));
  }, []);

  // Close the lightbox with the Escape key.
  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader /></div>;
  if (error) return <div className="min-h-screen pt-24"><EmptyState message={error} /></div>;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Gallery header */}
        <header className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">Inside ApexFit</p><h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">Our Gallery</h1><p className="mt-4 text-slate-600">A look at the people, energy, and progress behind the workouts.</p></header>
        {!items.length && <EmptyState message="No gallery images are available yet." />}
        {/* Responsive image grid from database records */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <button key={item._id} onClick={() => setSelected(item)} aria-label={`View ${item.title}`} className="group relative h-72 overflow-hidden rounded-3xl bg-slate-200 text-left shadow-lg shadow-red-500/20"><img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur transition group-hover:opacity-100"><Maximize2 size={14} /> Tap to view</span><div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 to-transparent p-5 pt-16 text-white"><p className="font-bold">{item.title}</p><p className="mt-1 text-sm text-slate-200">{item.category}</p></div></button>)}</div>
      </div>
      {/* Accessible lightbox for a selected gallery image (click outside or press Escape to close) */}
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" onClick={() => setSelected(null)}><div className="relative max-h-[90vh] max-w-4xl" onClick={(event) => event.stopPropagation()}><button onClick={() => setSelected(null)} aria-label="Close image" className="absolute -top-12 right-0 rounded-full bg-white p-2 text-black transition hover:bg-slate-200 sm:-right-4 sm:-top-4"><X size={20} /></button><img src={selected.image} alt={selected.title} className="max-h-[85vh] rounded-2xl object-contain" /><div className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-linear-to-t from-black/75 to-transparent p-4 pt-10 text-white"><p className="font-bold">{selected.title}</p>{selected.category && <p className="text-sm text-slate-300">{selected.category}</p>}</div></div></div>}
    </main>
  );
};

export default Gallery;

import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import AdminShell from "../../Common/AdminShell";
import EmptyState from "../../Common/EmptyState";
import Loader from "../../Common/Loader";
import { createBlog, deleteBlog, getAllBlogs, updateBlog } from "../../../api/blog.api";

const CATEGORIES = ["Workout", "Nutrition", "Weight Loss", "Muscle Gain", "Lifestyle", "Motivation"];

const EMPTY_FORM = {
  title: "",
  excerpt: "",
  content: "",
  category: "Workout",
  tagsInput: "",
  author: "ApexFit",
  featured: false,
  status: "Published",
};

// Protected admin workspace: publish and maintain blog posts.
const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const response = await getAllBlogs();
      setBlogs(response.data?.blogs || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load blogs.");
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
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (blog) => {
    setEditingId(blog._id);
    setForm({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      tagsInput: (blog.tags || []).join(", "),
      author: blog.author || "ApexFit",
      featured: Boolean(blog.featured),
      status: blog.status || "Draft",
    });
    setImageFile(null);
    setShowForm(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("excerpt", form.excerpt);
      payload.append("content", form.content);
      payload.append("category", form.category);
      payload.append("tags", JSON.stringify(form.tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean)));
      payload.append("author", form.author);
      payload.append("featured", form.featured);
      payload.append("status", form.status);
      if (imageFile) payload.append("image", imageFile);

      if (editingId) await updateBlog(editingId, payload);
      else await createBlog(payload);
      setShowForm(false);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save the blog post.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    try {
      await deleteBlog(blog._id);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete the blog post.");
    }
  };

  return (
    <AdminShell
      title="Blogs"
      description="Write fitness articles and publish them to the public blog page."
      action={
        <button onClick={openCreate} className="inline-flex items-center gap-2 self-start rounded-xl border-2 border-black bg-black px-4 py-3 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-transparent hover:text-black">
          <Plus size={18} /> New post
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-16"><Loader /></div>
      ) : (
        <>
          {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-lg shadow-red-500/15">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
                <tr><th className="p-5">Post</th><th className="p-5">Category</th><th className="p-5">Author</th><th className="p-5">Status</th><th className="p-5">Actions</th></tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog._id} className="border-b border-slate-100 last:border-0">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <img src={blog.image} alt={blog.title} className="h-12 w-20 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-slate-900">{blog.title}</p>
                          <p className="max-w-md truncate text-sm text-slate-500">{blog.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5"><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{blog.category}</span></td>
                    <td className="p-5 text-slate-600">{blog.author}</td>
                    <td className="p-5">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${blog.status === "Published" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{blog.status}</span>
                      {blog.featured && <span className="ml-1 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">Featured</span>}
                    </td>
                    <td className="p-5">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(blog)} aria-label={`Edit ${blog.title}`} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Pencil size={17} /></button>
                        <button onClick={() => remove(blog)} aria-label={`Delete ${blog.title}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!blogs.length && <EmptyState message="No blog posts yet. Write your first article." />}
          </div>
        </>
      )}

      {/* Add/edit blog modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-10">
          <form onSubmit={submit} className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl shadow-red-500/30">
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close form" className="absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-slate-900">{editingId ? "Edit blog post" : "New blog post"}</h2>
            <div className="mt-6 space-y-4">
              <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Post title" className="w-full rounded-xl border p-3" />
              <textarea required value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} rows="2" placeholder="Short excerpt shown on cards" className="w-full resize-none rounded-xl border p-3" />
              <textarea required value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} rows="8" placeholder="Full article content" className="w-full resize-none rounded-xl border p-3" />
              <div className="grid gap-4 sm:grid-cols-3">
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="rounded-xl border p-3">
                  {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                </select>
                <input value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} placeholder="Author" className="rounded-xl border p-3" />
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="rounded-xl border p-3">
                  <option>Published</option><option>Draft</option>
                </select>
              </div>
              <input value={form.tagsInput} onChange={(event) => setForm({ ...form, tagsInput: event.target.value })} placeholder="Tags (comma separated)" className="w-full rounded-xl border p-3" />
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Feature this post on the blog page
              </label>
              <input type="file" accept="image/*" required={!editingId} onChange={(event) => setImageFile(event.target.files?.[0] || null)} className="w-full rounded-xl border p-3 file:mr-3 file:rounded-lg file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-white" />
              {editingId && !imageFile && <p className="text-xs text-slate-400">Leave the file empty to keep the current cover image.</p>}
            </div>
            <button disabled={saving} className="mt-6 w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
              {editingId ? "Save changes" : "Publish post"}
            </button>
          </form>
        </div>
      )}
    </AdminShell>
  );
};

export default AdminBlogs;

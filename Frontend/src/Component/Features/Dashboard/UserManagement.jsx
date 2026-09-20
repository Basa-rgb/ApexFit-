import React, { useEffect, useState } from "react";
import { ArrowLeft, Pencil, Plus, Search, Trash2, UserRound, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createAdminUser, deleteAdminUser, getAdminUsers, updateAdminUser } from "../../../api/admin.api";
import EmptyState from "../../Common/EmptyState";

const EMPTY_FORM = { name: "", email: "", password: "", role: "user" };

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async (term = search) => {
    try {
      const response = await getAdminUsers(term);
      setUsers(response.data?.users || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load users.");
    }
  };

  useEffect(() => { loadUsers(""); }, []);

  const submitUser = async (event) => {
    event.preventDefault();
    try {
      if (editing) await updateAdminUser(editing._id, { name: form.name, role: form.role, isActive: form.isActive });
      else await createAdminUser(form);
      setForm(EMPTY_FORM);
      setEditing(null);
      setShowForm(false);
      loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save user.");
    }
  };

  const startEdit = (user) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role, isActive: user.isActive !== false });
    setShowForm(true);
  };

  const removeUser = async (user) => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    try { await deleteAdminUser(user._id); loadUsers(); } catch (requestError) { setError(requestError.response?.data?.message || "Could not delete user."); }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Users workspace header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><button onClick={() => navigate("/admin/dashboard")} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-black"><ArrowLeft size={17} /> Admin dashboard</button><p className="text-sm font-bold uppercase tracking-[0.2em] text-red-500">Admin workspace</p><h1 className="mt-2 text-4xl font-bold text-slate-900">Users</h1><p className="mt-2 text-slate-600">View, search, update, and remove member accounts.</p></div><button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-black px-4 py-3 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-transparent hover:text-black"><Plus size={18} /> Add user</button></div>
        {/* Search controls */}
        <div className="mt-8 flex gap-3"><div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && loadUsers()} placeholder="Search by name or email" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-[#27253F]" /></div><button onClick={() => loadUsers()} className="rounded-xl bg-[#27253F] px-5 font-semibold text-white">Search</button></div>
        {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
        {/* User table */}
        <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-lg shadow-red-500/15"><table className="w-full min-w-180 text-left"><thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500"><tr><th className="p-5">User</th><th className="p-5">Role</th><th className="p-5">Status</th><th className="p-5">Actions</th></tr></thead><tbody>{users.map((user) => <tr key={user._id} className="border-b border-slate-100 last:border-0"><td className="p-5"><p className="font-bold text-slate-900">{user.name}</p><p className="text-sm text-slate-500">{user.email}</p></td><td className="p-5"><span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">{user.role}</span></td><td className="p-5"><span className={`rounded-full px-3 py-1 text-sm font-semibold ${user.isActive !== false ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{user.isActive !== false ? "Active" : "Inactive"}</span></td><td className="p-5"><div className="flex gap-2"><button onClick={() => startEdit(user)} aria-label={`Edit ${user.name}`} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Pencil size={17} /></button><button onClick={() => removeUser(user)} aria-label={`Delete ${user.name}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button></div></td></tr>)}</tbody></table>{!users.length && <EmptyState message="No users found." />}</div>
      </div>
      {/* Add/edit user modal */}
      {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"><form onSubmit={submitUser} className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"><button type="button" onClick={() => setShowForm(false)} className="absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100"><X size={20} /></button><UserRound className="text-red-500" size={35} /><h2 className="mt-3 text-2xl font-bold">{editing ? "Edit user" : "Add user"}</h2><div className="mt-6 space-y-4"><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full name" className="w-full rounded-xl border p-3" /><input required disabled={Boolean(editing)} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" className="w-full rounded-xl border p-3 disabled:bg-slate-100" />{!editing && <input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Temporary password" className="w-full rounded-xl border p-3" />}<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="w-full rounded-xl border p-3"><option value="user">User</option><option value="trainer">Trainer</option><option value="admin">Admin</option></select>{editing && <label className="flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Account active</label>}</div><button className="mt-6 w-full rounded-xl bg-black py-3 font-semibold text-white">{editing ? "Save changes" : "Create user"}</button></form></div>}
    </main>
  );
};

export default UserManagement;

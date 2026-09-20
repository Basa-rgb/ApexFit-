import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, UserRound } from "lucide-react";
import { getProfile } from "../../../api/user.api";
import Loader from "../../Common/Loader";
import EmptyState from "../../Common/EmptyState";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load the current user's profile from the protected API.
    getProfile().then((response) => setUser(response.data?.user)).catch((requestError) => setError(requestError.response?.data?.message || "Could not load profile."));
  }, []);

  if (error) return <div className="min-h-screen pt-24"><EmptyState message={error} /></div>;
  if (!user) return <div className="flex min-h-screen items-center justify-center"><Loader /></div>;

  return <main className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6"><div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-red-500/20"><UserRound className="text-red-500" size={38} /><h1 className="mt-4 text-3xl font-bold text-slate-900">My profile</h1><div className="mt-8 space-y-4 text-slate-600"><p className="flex items-center gap-3"><UserRound size={19} />{user.name}</p><p className="flex items-center gap-3"><Mail size={19} />{user.email}</p>{user.phone && <p className="flex items-center gap-3"><Phone size={19} />{user.phone}</p>}</div><Link to="/dashboard" className="mt-8 inline-block rounded-xl bg-black px-5 py-3 font-semibold text-white shadow-lg shadow-red-500/30">Back to dashboard</Link></div></main>;
};

export default Profile;

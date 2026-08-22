import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarRange, ChefHat, Utensils, UserRound } from "lucide-react";
import { getAllDietPlans } from "../../../api/diet.api";
import Loader from "../../Common/Loader";
import EmptyState from "../../Common/EmptyState";

const DietPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load diet plans created by trainers from the database.
    getAllDietPlans()
      .then((response) => setPlans(response.data?.dietPlans || []))
      .catch((requestError) => setError(requestError.response?.data?.message || "Could not load diet plans."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader /></div>;
  if (error) return <div className="min-h-screen pt-24"><EmptyState message={error} /></div>;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Diet plan page heading */}
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">Nutrition library</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">Diet Plans</h1>
          <p className="mt-4 text-slate-600">Nutrition plans designed to support your training and lifestyle.</p>
        </header>
        {plans.length === 0 && <EmptyState message="No diet plans are available yet." />}
        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-red-500/20 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/35">
              {/* Diet plan summary card */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700"><Utensils size={28} /></div>
              <p className="mt-5 text-xs font-bold uppercase tracking-widest text-red-500">{plan.goal}</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">{plan.title}</h2>
              <div className="mt-4 space-y-2 text-sm text-slate-600"><p className="flex items-center gap-2"><CalendarRange size={17} /> {plan.duration}</p><p className="flex items-center gap-2"><ChefHat size={17} /> {plan.meals?.length || 0} meals planned</p><p className="flex items-center gap-2"><UserRound size={17} /> {plan.trainerId?.fullName || "ApexFit nutrition team"}</p></div>
              <Link to={`/dietplans/${plan._id}`} className="mt-6 block rounded-xl border-2 border-black bg-black py-3 text-center font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-transparent hover:text-black">View diet plan</Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

export default DietPlans;

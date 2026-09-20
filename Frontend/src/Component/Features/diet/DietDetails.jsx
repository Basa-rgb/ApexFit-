import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Flame, Utensils } from "lucide-react";
import { getDietPlanById } from "../../../api/diet.api";
import Loader from "../../Common/Loader";
import EmptyState from "../../Common/EmptyState";

const DietDetails = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load the selected diet plan and populated trainer from the database.
    getDietPlanById(id)
      .then((response) => setPlan(response.data?.dietPlan))
      .catch((requestError) => setError(requestError.response?.data?.message || "Could not load diet plan."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader /></div>;
  if (error || !plan) return <div className="min-h-screen pt-24"><EmptyState message={error || "Diet plan not found."} /></div>;

  const totalCalories = (plan.meals || []).reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Back navigation */}
        <Link to="/dietplans" className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-black px-4 py-2.5 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-transparent hover:text-black"><ArrowLeft size={18} /> Back to diet plans</Link>
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-red-500/20 sm:p-10">
          {/* Diet plan overview */}
          <p className="text-sm font-bold uppercase tracking-widest text-red-500">{plan.goal}</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">{plan.title}</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600"><span className="rounded-full bg-slate-100 px-4 py-2">{plan.duration}</span><span className="rounded-full bg-slate-100 px-4 py-2">Trainer: {plan.trainerId?.fullName || "ApexFit team"}</span><span className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-semibold ${totalCalories > 0 ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-400"}`}><Flame size={15} /> {totalCalories > 0 ? `${totalCalories.toLocaleString()} kcal / day` : "Calories not set"}</span></div>
          <h2 className="mt-10 flex items-center gap-2 text-2xl font-bold text-slate-900"><Utensils size={24} /> Meal plan</h2>
          {/* Meal cards with food items and calories */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {plan.meals?.map((meal, index) => <article key={`${meal.mealType}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md shadow-red-500/20"><h3 className="text-lg font-bold text-slate-900">{meal.mealType}</h3><ul className="mt-3 space-y-2 text-sm text-slate-600">{meal.foodItems?.map((food) => <li key={food}>• {food}</li>)}</ul><p className="mt-4 flex items-center gap-2 font-semibold text-orange-600"><Flame size={17} /> {meal.calories ? `${Number(meal.calories).toLocaleString()} calories` : "Calories not set"}</p></article>)}
          </div>
        </section>
      </div>
    </main>
  );
};

export default DietDetails;

import React, { useEffect, useState } from "react";
import { getAllWorkouts } from "../../../api/workout.api";
import Loader from "../../Common/Loader";
import WorkoutCard from "./WorkoutCard";
import EmptyState from "../../Common/EmptyState";

const WorkoutPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await getAllWorkouts();
        setPlans(response.data?.workoutPlans || []);
      } catch (requestError) {
        if (requestError.response?.status !== 404) {
          setError(requestError.response?.data?.message || "Could not load workout plans.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-indigo-600">Training library</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">Workout Plans</h1>
          <p className="mt-4 text-slate-600">Find a structured plan designed to move you closer to your goals.</p>
        </header>
        {loading && <div className="flex justify-center py-20"><Loader /></div>}
        {error && <EmptyState message={error} />}
        {!loading && !error && plans.length === 0 && (
          <EmptyState message="No workout plans are available yet." />
        )}
        {!loading && !error && plans.length > 0 && (
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => <WorkoutCard key={plan._id} plan={plan} />)}
          </div>
        )}
      </div>
    </main>
  );
};

export default WorkoutPlans;

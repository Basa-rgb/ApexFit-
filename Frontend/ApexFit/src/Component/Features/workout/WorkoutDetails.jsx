import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock3, Gauge, Timer } from "lucide-react";
import { getWorkoutById } from "../../../api/workout.api";
import Loader from "../../Common/Loader";
import ExerciseCard from "./ExerciseCard";
import EmptyState from "../../Common/EmptyState";

const WorkoutDetails = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load the selected workout plan from the database.
    getWorkoutById(id)
      .then((response) => setPlan(response.data?.workoutPlan))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message ||
            "Could not load workout plan.",
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  if (error || !plan)
    return (
      <div className="min-h-screen pt-24"><EmptyState message={error || "Workout plan not found."} /></div>
    );

  // Use the populated trainer name when available.
  const trainerName = plan.trainerId?.fullName || "ApexFit Training Team";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Return to the workout plan library */}
        <Link
          to="/workouts"
          className="group inline-flex items-center gap-2 rounded-xl border-2 border-black bg-black px-4 py-2.5 font-semibold text-white shadow-lg shadow-red-500/30 transition duration-300 hover:-translate-x-1 hover:bg-transparent hover:text-black hover:shadow-xl hover:shadow-red-500/40"
        >
          <ArrowLeft
            size={18}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to workout plans
        </Link>

        {/* Workout overview and hero image */}
        <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="grid md:grid-cols-2">
            <div className="min-h-72 bg-linear-to-br from-[#27253F] to-indigo-500">
              {plan.image && (
                <img
                  src={plan.image}
                  alt={plan.title}
                  className="h-full min-h-72 w-full object-cover"
                />
              )}
            </div>
            <div className="p-7 sm:p-10">
              <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                {plan.goal}
              </p>
              <h1 className="mt-3 text-4xl font-bold text-slate-900">
                {plan.title}
              </h1>
              <p className="mt-4 leading-7 text-slate-600">
                {plan.description || "No description available."}
              </p>

              {/* Difficulty, duration, schedule, and session summary */}
              <div className="mt-7 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-100 p-3 shadow-md shadow-red-500/20 transition hover:shadow-lg hover:shadow-red-500/35  cursor-pointer">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Gauge size={18} />
                    <b>Difficulty</b>
                  </div>
                  <p className="mt-1 text-slate-700">{plan.difficulty}</p>
                </div>
                <div className="rounded-xl bg-slate-100 p-3 shadow-md shadow-red-500/20 transition hover:shadow-lg hover:shadow-red-500/35 cursor-pointer">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Clock3 size={18} />
                    <b>Duration</b>
                  </div>
                  <p className="mt-1 text-slate-700">{plan.duration}</p>
                </div>
                <div className="rounded-xl bg-slate-100 p-3 shadow-md shadow-red-500/20 transition hover:shadow-lg hover:shadow-red-500/35 cursor-pointer">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <CalendarDays size={18} />
                    <b>Schedule</b>
                  </div>
                  <p className="mt-1 text-slate-700">
                    {plan.daysPerWeek || "—"} days/week
                  </p>
                </div>
                <div className="rounded-xl bg-slate-100 p-3 shadow-md shadow-red-500/20 transition hover:shadow-lg hover:shadow-red-500/35 cursor-pointer">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Timer size={18} />
                    <b>Session</b>
                  </div>
                  <p className="mt-1 text-slate-700">
                    {plan.estimatedSessionTime || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Training information and equipment */}
          <div className="border-t border-slate-100 p-7 sm:p-10">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Training information
                </h2>
                <p className="mt-3 text-slate-600">
                  For: {plan.targetAudience}
                </p>
                <p className="mt-2 text-slate-600">Trainer: {trainerName}</p>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Equipment</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(plan.equipment || []).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-indigo-50 px-3 py-2 text-sm text-indigo-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Exercises included in this workout plan */}
            <h2 className="mt-10 text-2xl font-bold text-slate-900">
              Exercises
            </h2>
            <div className="mt-5 grid gap-4">
              {(plan.exercises || []).map((exercise, index) => (
                <ExerciseCard
                  key={`${exercise.name}-${index}`}
                  exercise={exercise}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default WorkoutDetails;

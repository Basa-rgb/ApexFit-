import React from "react";
import { Link } from "react-router-dom";

const WorkoutCard = ({ plan }) => (
  <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-red-500/30 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-500/40">
    {/* Plan image and difficulty badge */}
    <div className="relative h-52 overflow-hidden bg-linear-to-br from-[#27253F] to-indigo-500">
      {plan.image && (
        <img
          src={plan.image}
          alt={plan.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      )}
      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#27253F]">
        {plan.difficulty || "All levels"}
      </span>
    </div>

    {/* Plan summary and goal */}
    <div className="p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
        {plan.goal}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">{plan.title}</h2>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
        {plan.description ||
          "A structured plan to help you reach your fitness goals."}
      </p>
      {/* Quick training statistics */}
      <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-600 ">
        {plan.duration && (
          <span className="rounded-full bg-slate-100 px-3 py-2">
            {plan.duration}
          </span>
        )}
        {plan.daysPerWeek && (
          <span className="rounded-full bg-slate-100 px-3 py-2">
            {plan.daysPerWeek} days/week
          </span>
        )}
        {plan.exercises?.length > 0 && (
          <span className="rounded-full bg-slate-100 px-3 py-2">
            {plan.exercises.length} exercises
          </span>
        )}
      </div>

      {/* Navigate to the complete workout plan */}
      <Link
        to={`/workouts/${plan._id}`}
        className="mt-6 block w-full rounded-xl border-2 border-black bg-black py-3.5 text-center text-lg font-semibold text-white shadow-lg shadow-red-500/30 transition duration-300 hover:bg-transparent hover:text-black hover:shadow-xl hover:shadow-red-500/40"
      >
        View Plan
      </Link>
    </div>
  </article>
);

export default WorkoutCard;

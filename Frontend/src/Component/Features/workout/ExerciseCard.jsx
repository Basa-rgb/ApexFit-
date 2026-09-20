import React from "react";

const ExerciseCard = ({ exercise, index }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-red-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-500/35">
    {/* Exercise number, image, and name */}
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#27253F] font-bold text-white">
        {String(index + 1).padStart(2, "0")}
      </div>
      {exercise.image && (
        <img
          src={exercise.image}
          alt={exercise.name}
          className="h-20 w-20 rounded-xl object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold text-slate-900">{exercise.name}</h3>

        {/* Exercise training metrics */}
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
          {exercise.sets !== undefined && <span>{exercise.sets} sets</span>}
          {exercise.reps !== undefined && <span>• {exercise.reps} reps</span>}
          {exercise.duration && <span>• {exercise.duration}</span>}
          {exercise.restTime && <span>• Rest {exercise.restTime}</span>}
        </div>
      </div>
    </div>

    {/* Optional exercise instructions */}
    {exercise.instructions && (
      <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">
        {exercise.instructions}
      </p>
    )}
  </article>
);

export default ExerciseCard;

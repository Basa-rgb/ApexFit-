import React from "react";
import { useSearchParams } from "react-router-dom";
import BookingForm from "./BookingForm";

const Booking = () => {
  const [searchParams] = useSearchParams();

  const trainerId = searchParams.get("trainer");

  return (
    <div className="min-h-screen bg-gray-100 py-20">
      <div className="max-w-4xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
            Book a Session
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-900">
            Schedule Your Training
          </h1>

          <p className="mt-4 text-slate-600">
            Choose your preferred date, time and training session.
          </p>
        </div>

        {/* Booking Form */}
        <BookingForm trainerId={trainerId} />

      </div>
    </div>
  );
};

export default Booking;
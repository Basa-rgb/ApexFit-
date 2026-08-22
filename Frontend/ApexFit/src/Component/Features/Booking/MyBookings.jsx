import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Dumbbell,
  Loader2,
  NotebookPen,
  Pencil,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { deleteBooking, getBookingOptions, getMyBookings, updateBooking } from "../../../api/booking.api";
import EmptyState from "../../Common/EmptyState";
import Loader from "../../Common/Loader";

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Confirmed: "bg-green-50 text-green-700",
  Completed: "bg-indigo-50 text-indigo-700",
  Cancelled: "bg-red-50 text-red-700",
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatHour = (hour) => {
  const normalizedHour = Number(hour) % 24;
  const suffix = normalizedHour >= 12 ? "PM" : "AM";
  const displayHour = normalizedHour % 12 || 12;
  return `${String(displayHour).padStart(2, "0")}:00 ${suffix}`;
};

const getSlotStartHour = (slot) => {
  let hour = Number(slot.startHour);
  const period = String(slot.label || "").toLowerCase();
  if ((period.includes("afternoon") || period.includes("evening")) && hour < 12) hour += 12;
  return hour;
};

const getSlotLabel = (slot) =>
  Number.isFinite(Number(slot.startHour))
    ? `${formatHour(getSlotStartHour(slot))} - ${formatHour(getSlotStartHour(slot) + 1)}`
    : slot.label;

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ bookingDate: "", timeSlot: "", notes: "" });
  const [slots, setSlots] = useState([]);
  const [saveState, setSaveState] = useState({ loading: false, error: "" });

  const loadBookings = async () => {
    try {
      const response = await getMyBookings();
      setBookings(response.data?.bookings || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const startEdit = async (booking) => {
    setEditing(booking);
    setEditForm({
      bookingDate: String(booking.bookingDate).split("T")[0],
      timeSlot: booking.timeSlot,
      notes: booking.notes || "",
    });
    setSaveState({ loading: false, error: "" });
    try {
      const response = await getBookingOptions(booking.trainerId?._id);
      const option = (response.data?.options || []).find((item) => item._id === booking.bookingOptionId);
      setSlots(option?.timeSlots || []);
    } catch {
      setSlots([]);
    }
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editing) return;
    setSaveState({ loading: true, error: "" });
    try {
      await updateBooking(editing._id, editForm);
      setEditing(null);
      loadBookings();
    } catch (requestError) {
      setSaveState({ loading: false, error: requestError.response?.data?.message || "Could not update booking." });
    }
  };

  const cancelBooking = async (booking) => {
    if (!window.confirm(`Cancel your ${booking.sessionType} session on ${formatDate(booking.bookingDate)}?`)) return;
    try {
      await updateBooking(booking._id, { status: "Cancelled" });
      loadBookings();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not cancel booking.");
    }
  };

  const removeBooking = async (booking) => {
    if (!window.confirm(`Delete this booking permanently? This cannot be undone.`)) return;
    try {
      await deleteBooking(booking._id);
      loadBookings();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete booking.");
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader /></div>;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">Your sessions</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">My Bookings</h1>
          <p className="mt-4 text-slate-600">Reschedule, cancel, or remove any of your booked sessions.</p>
        </header>

        {error && <EmptyState message={error} />}

        {!error && bookings.length === 0 && (
          <div className="mt-10">
            <EmptyState message="You have no bookings yet." />
            <div className="mt-6 text-center">
              <Link to="/booking" className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-black px-5 py-3 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-transparent hover:text-black">
                <CalendarDays size={18} /> Book a session
              </Link>
            </div>
          </div>
        )}

        <div className="mt-10 space-y-4">
          {bookings.map((booking) => (
            <article key={booking._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-red-500/15">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900">{booking.sessionType}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[booking.status] || "bg-slate-100 text-slate-600"}`}>
                      {booking.status}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${booking.paymentStatus === "Paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      Payment: {booking.paymentStatus}
                    </span>
                  </div>
                  <p className="flex items-center gap-2 text-sm text-slate-600"><Dumbbell size={16} className="text-red-500" /> {booking.trainerId?.fullName || "Trainer removed"}</p>
                  <p className="flex items-center gap-2 text-sm text-slate-600"><CalendarDays size={16} className="text-red-500" /> {formatDate(booking.bookingDate)}</p>
                  <p className="flex items-center gap-2 text-sm text-slate-600"><Clock size={16} className="text-red-500" /> {booking.timeSlot}</p>
                  <p className="flex items-center gap-2 text-sm text-slate-600"><Wallet size={16} className="text-red-500" /> Rs. {(booking.amount || 0).toLocaleString()} · {booking.paymentMethod}</p>
                  {booking.notes && <p className="flex max-w-md items-start gap-2 text-sm text-slate-500"><NotebookPen size={16} className="mt-0.5 shrink-0 text-red-500" /> {booking.notes}</p>}
                </div>

                {booking.status !== "Cancelled" && booking.status !== "Completed" && (
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => startEdit(booking)} aria-label="Edit booking" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-black hover:text-black">
                      <Pencil size={16} /> Edit
                    </button>
                    <button onClick={() => cancelBooking(booking)} className="inline-flex items-center gap-2 rounded-xl border border-amber-300 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-50">
                      Cancel
                    </button>
                  </div>
                )}
                <button onClick={() => removeBooking(booking)} aria-label="Delete booking" className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:self-center">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>

        {!error && bookings.length > 0 && (
          <p className="mt-8 text-center text-sm text-slate-500">
            Need another session? <Link to="/booking" className="font-semibold text-red-600 hover:underline">Book here</Link>.
          </p>
        )}
      </div>

      {/* Edit booking modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <form onSubmit={saveEdit} className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl shadow-red-500/30">
            <button type="button" onClick={() => setEditing(null)} aria-label="Close editor" className="absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-slate-900">Edit booking</h2>
            <p className="mt-1 text-sm text-slate-500">{editing.sessionType} with {editing.trainerId?.fullName || "your trainer"}</p>
            {saveState.error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{saveState.error}</p>}

            <label className="mt-6 block text-sm font-semibold text-gray-700">Booking date</label>
            <input type="date" required min={todayStr} value={editForm.bookingDate} onChange={(event) => setEditForm({ ...editForm, bookingDate: event.target.value, timeSlot: "" })} className="mt-2 w-full rounded-xl border p-3" />

            <label className="mt-4 block text-sm font-semibold text-gray-700">Time slot</label>
            <select required value={editForm.timeSlot} onChange={(event) => setEditForm({ ...editForm, timeSlot: event.target.value })} disabled={!slots.length} className="mt-2 w-full rounded-xl border p-3 disabled:opacity-60">
              <option value="">{slots.length ? "Select a time slot" : "No slots configured"}</option>
              {slots.map((slot) => (
                <option key={`${slot.label}-${slot.startHour}`} value={getSlotLabel(slot)}>{getSlotLabel(slot)}</option>
              ))}
            </select>

            <label className="mt-4 block text-sm font-semibold text-gray-700">Notes</label>
            <textarea rows="3" maxLength={300} value={editForm.notes} onChange={(event) => setEditForm({ ...editForm, notes: event.target.value })} className="mt-2 w-full resize-none rounded-xl border p-3" placeholder="Anything the trainer should know?" />

            <button disabled={saveState.loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-black py-3 font-semibold text-white transition hover:bg-transparent hover:text-black disabled:opacity-60">
              {saveState.loading && <Loader2 size={18} className="animate-spin" />} Save changes
            </button>
          </form>
        </div>
      )}
    </main>
  );
};

export default MyBookings;

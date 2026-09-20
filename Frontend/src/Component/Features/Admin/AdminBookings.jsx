import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import AdminShell from "../../Common/AdminShell";
import EmptyState from "../../Common/EmptyState";
import Loader from "../../Common/Loader";
import { deleteBooking, getAllBookings, updateBooking } from "../../../api/booking.api";

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Confirmed: "bg-green-50 text-green-700",
  Completed: "bg-indigo-50 text-indigo-700",
  Cancelled: "bg-red-50 text-red-700",
};

// Protected admin workspace: review and manage every booking.
const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = await getAllBookings();
      setBookings(response.data?.bookings || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (booking, status) => {
    try {
      await updateBooking(booking._id, { status });
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not update booking.");
    }
  };

  const remove = async (booking) => {
    if (!window.confirm("Delete this booking permanently? This cannot be undone.")) return;
    try {
      await deleteBooking(booking._id);
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete booking.");
    }
  };

  return (
    <AdminShell title="Bookings" description="Confirm, complete, or clean up member session bookings.">
      {loading ? (
        <div className="flex justify-center py-16"><Loader /></div>
      ) : (
        <>
          {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-lg shadow-red-500/15">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
                <tr><th className="p-5">Member</th><th className="p-5">Trainer</th><th className="p-5">Session</th><th className="p-5">When</th><th className="p-5">Amount</th><th className="p-5">Status</th><th className="p-5">Actions</th></tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-slate-100 last:border-0">
                    <td className="p-5"><p className="font-bold text-slate-900">{booking.userId?.name || "Unknown"}</p><p className="text-sm text-slate-500">{booking.userId?.email}</p></td>
                    <td className="p-5 text-slate-600">{booking.trainerId?.fullName || "—"}</td>
                    <td className="p-5 text-slate-600">{booking.sessionType}<br /><span className="text-sm text-slate-400">{booking.timeSlot}</span></td>
                    <td className="p-5 text-slate-600">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                    <td className="p-5 text-slate-600">Rs. {(booking.amount || 0).toLocaleString()}</td>
                    <td className="p-5">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[booking.status] || "bg-slate-100 text-slate-600"}`}>{booking.status}</span>
                      <br />
                      <span className="mt-1 inline-block text-xs text-slate-400">Payment: {booking.paymentStatus}</span>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <select value={booking.status} onChange={(event) => changeStatus(booking, event.target.value)} aria-label={`Change status for booking ${booking._id}`} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
                          <option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option>
                        </select>
                        <button onClick={() => remove(booking)} aria-label="Delete booking" className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!bookings.length && <EmptyState message="No bookings found." />}
          </div>
        </>
      )}
    </AdminShell>
  );
};

export default AdminBookings;

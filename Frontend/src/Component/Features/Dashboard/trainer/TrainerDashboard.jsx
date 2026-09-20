import React, { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Dumbbell,
  LayoutDashboard,
  Loader2,
  MessageSquareQuote,
  Pencil,
  Plus,
  Star,
  Tag,
  Trash2,
  UserRound,
  Users,
  Utensils,
  X,
} from "lucide-react";
import EmptyState from "../../../Common/EmptyState";
import {
  deleteMySessionType,
  getMySessionTypes,
  createMySessionType,
  updateMySessionType,
  updateBooking,
} from "../../../../api/booking.api";
import { updateMyTrainerProfile } from "../../../../api/trainer.api";
import { createWorkout, deleteWorkout } from "../../../../api/workout.api";
import { createDietPlan, deleteDietPlan } from "../../../../api/diet.api";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DIET_GOALS = ["Weight Loss", "Muscle Gain", "Maintenance", "Healthy Lifestyle"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"];
const TABS = [
  ["Overview", LayoutDashboard],
  ["My Profile", UserRound],
  ["Sessions", Tag],
  ["Bookings", CalendarDays],
  ["Schedule", Clock],
  ["My Clients", Users],
  ["Workouts", Dumbbell],
  ["Diet Plans", Utensils],
  ["Earnings", BarChart3],
  ["Reviews", Star],
];

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-lg shadow-red-500/15 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ icon: Icon, label, value }) => (
  <Card className="p-5">
    <Icon className="text-red-500" size={21} />
    <p className="mt-5 text-2xl font-bold text-slate-900">{value}</p>
    <p className="mt-1 text-sm text-slate-500">{label}</p>
  </Card>
);

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Confirmed: "bg-green-50 text-green-700",
  Completed: "bg-indigo-50 text-indigo-700",
  Cancelled: "bg-red-50 text-red-700",
};

const Stars = ({ value, size = 16 }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={star <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"}
      />
    ))}
  </span>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-100">
          <X size={20} />
        </button>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  </div>
);

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-black";

const dateOf = (value) => String(value).split("T")[0];
const todayStr = () => new Date().toISOString().split("T")[0];
const money = (amount) => `Rs. ${(Number(amount) || 0).toLocaleString()}`;

const BookingRow = ({ booking, busyId, onStatus }) => {
  const member = booking.userId || {};
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="font-bold text-slate-900">{member.name || "Member"}</p>
            <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${statusStyles[booking.status] || "bg-slate-100 text-slate-600"}`}>
              {booking.status}
            </span>
            <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${booking.paymentStatus === "Paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
              Payment: {booking.paymentStatus}
            </span>
          </div>
          <p className="text-sm text-slate-500">{booking.sessionType || "Personal training"} · {booking.timeSlot}</p>
          <p className="text-sm text-slate-600">
            {new Date(booking.bookingDate).toLocaleDateString()} · {money(booking.amount)} ({booking.paymentMethod})
          </p>
          {(member.phone || member.email) && (
            <p className="text-sm text-slate-400">{member.phone} · {member.email}</p>
          )}
          {booking.notes && <p className="text-sm italic text-slate-400">“{booking.notes}”</p>}
        </div>
        {!["Completed", "Cancelled"].includes(booking.status) && (
          <div className="flex shrink-0 flex-wrap gap-2">
            {booking.status !== "Confirmed" && (
              <button
                disabled={busyId === booking._id}
                onClick={() => onStatus(booking, "Confirmed")}
                className="rounded-xl border border-green-300 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50 disabled:opacity-50"
              >
                Confirm
              </button>
            )}
            {booking.status === "Confirmed" && (
              <button
                disabled={busyId === booking._id}
                onClick={() => onStatus(booking, "Completed")}
                className="rounded-xl border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-50"
              >
                Mark completed
              </button>
            )}
            <button
              disabled={busyId === booking._id}
              onClick={() => onStatus(booking, "Cancelled")}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

const OverviewTab = ({ data }) => {
  const stats = data.stats || {};
  const bookings = data.bookings || [];
  const today = todayStr();
  const todaysSessions = bookings.filter((booking) => dateOf(booking.bookingDate) === today && !["Cancelled"].includes(booking.status));
  const upcoming = bookings.filter((booking) => dateOf(booking.bookingDate) >= today && ["Pending", "Confirmed"].includes(booking.status));

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label="Today's sessions" value={stats.todaysSessions ?? 0} />
        <StatCard icon={CalendarCheck} label="Upcoming sessions" value={stats.upcomingSessions ?? 0} />
        <StatCard icon={Clock} label="Pending requests" value={stats.pendingRequests ?? 0} />
        <StatCard icon={BarChart3} label="This month's earnings" value={money(stats.monthlyEarnings)} />
        <StatCard icon={Users} label="Members trained" value={stats.totalMembers ?? 0} />
        <StatCard icon={UserRound} label="Active members" value={stats.activeMembers ?? 0} />
        <StatCard icon={LayoutDashboard} label="Completed sessions" value={stats.completedSessions ?? 0} />
        <StatCard icon={Star} label={`Rating · ${stats.totalReviews || 0} reviews`} value={`${stats.rating || 0}/5`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900">Today's sessions</h3>
          {!todaysSessions.length ? (
            <p className="mt-4 text-sm text-slate-500">No sessions scheduled for today.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {todaysSessions.map((booking) => (
                <li key={booking._id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="font-bold text-slate-900">{booking.userId?.name || "Member"}</p>
                    <p className="text-sm text-slate-500">{booking.timeSlot}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[booking.status]}`}>{booking.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900">Upcoming sessions</h3>
          {!upcoming.length ? (
            <p className="mt-4 text-sm text-slate-500">Nothing coming up yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcoming.slice(0, 5).map((booking) => (
                <li key={booking._id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="font-bold text-slate-900">{booking.userId?.name || "Member"}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(booking.bookingDate).toLocaleDateString()} · {booking.timeSlot}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[booking.status]}`}>{booking.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h3 className="text-lg font-bold text-slate-900">Recent activity</h3>
        {!data.recentActivities?.length ? (
          <p className="mt-4 text-sm text-slate-500">No recent activity.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {data.recentActivities.map((activity) => (
              <li key={activity._id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-slate-600">
                  <b className="text-slate-900">{activity.userId?.name || "A member"}</b> booked a session
                </span>
                <span className="shrink-0 pl-4 text-xs text-slate-400">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
};

const ProfileTab = ({ trainer, refresh }) => {
  const [form, setForm] = useState({
    fullName: trainer.fullName || "",
    phone: trainer.phone || "",
    gender: trainer.gender || "",
    bio: trainer.bio || "",
    specialization: (trainer.specialization || []).join(", "),
    certifications: (trainer.certifications || []).join(", "),
    experience: trainer.experience || "",
    availableDays: trainer.availableDays || [],
    start: trainer.availableTime?.start || "",
    end: trainer.availableTime?.end || "",
    facebook: trainer.socialLinks?.facebook || "",
    instagram: trainer.socialLinks?.instagram || "",
    linkedin: trainer.socialLinks?.linkedin || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(trainer.profileImage || "");
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleDay = (day) =>
    setForm((current) => ({
      ...current,
      availableDays: current.availableDays.includes(day)
        ? current.availableDays.filter((item) => item !== day)
        : [...current.availableDays, day],
    }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorText("");
    try {
      const payload = new FormData();
      payload.append("fullName", form.fullName);
      payload.append("phone", form.phone);
      payload.append("gender", form.gender);
      payload.append("bio", form.bio);
      payload.append("specialization", JSON.stringify(form.specialization.split(",").map((item) => item.trim()).filter(Boolean)));
      payload.append("certifications", JSON.stringify(form.certifications.split(",").map((item) => item.trim()).filter(Boolean)));
      payload.append("experience", form.experience);
      payload.append("availableDays", JSON.stringify(form.availableDays));
      payload.append("availableTime", JSON.stringify({ start: form.start, end: form.end }));
      payload.append("facebook", form.facebook);
      payload.append("instagram", form.instagram);
      payload.append("linkedin", form.linkedin);
      if (imageFile) payload.append("image", imageFile);
      await updateMyTrainerProfile(payload);
      setShowSuccess(true);
      refresh();
    } catch {
      setErrorText("Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-900">Trainer details</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">Full name</span>
            <input placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">Phone</span>
            <input type="tel" placeholder="98XXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">Gender</span>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={inputClass}>
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">Years of experience</span>
            <input type="number" min="0" placeholder="e.g. 5" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Bio</span>
            <textarea rows={3} placeholder="Tell members about your training style…" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">Specializations</span>
            <input placeholder="Strength, Yoga (comma separated)" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">Certifications</span>
            <input placeholder="NASM, ACE (comma separated)" value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} className={inputClass} />
          </label>
          <div className="flex items-center gap-4 sm:col-span-2">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile preview" className="h-16 w-16 rounded-full border border-slate-200 object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <UserRound size={24} />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-black px-4 py-2 text-sm font-semibold transition hover:bg-black hover:text-white">
                <Pencil size={15} /> {imageFile ? "Choose different photo" : "Choose photo"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
              {imageFile ? (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                  <CheckCircle2 size={14} /> New photo ready — “{imageFile.name}”. Press Save to upload.
                </p>
              ) : (
                <p className="text-xs text-slate-400">No new photo selected yet.</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-900">Availability</h3>
        <p className="mt-1 text-sm text-slate-500">Session pricing is managed separately in the “Sessions” tab.</p>
        <div className="mt-5 grid gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Available days</p>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    form.availableDays.includes(day)
                      ? "bg-red-500 text-white"
                      : "border border-slate-200 text-slate-600 hover:border-red-300"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <label className="flex-1 space-y-1">
              <span className="text-sm font-semibold text-slate-700">From</span>
              <input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className={inputClass} />
            </label>
            <label className="flex-1 space-y-1">
              <span className="text-sm font-semibold text-slate-700">To</span>
              <input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className={inputClass} />
            </label>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-900">Social links</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <input placeholder="Facebook URL" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} className={inputClass} />
          <input placeholder="Instagram URL" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className={inputClass} />
          <input placeholder="LinkedIn URL" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className={inputClass} />
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-black px-6 py-3 font-semibold text-white transition hover:bg-transparent hover:text-black disabled:opacity-60"
        >
        {saving && <Loader2 size={18} className="animate-spin" />} Save changes
      </button>
      {errorText && <span className="text-sm font-semibold text-red-500">{errorText}</span>}
      </div>

      {showSuccess && (
        <Modal title="Profile saved" onClose={() => setShowSuccess(false)}>
          <p className="text-sm leading-6 text-slate-600">
            Your profile has been updated successfully. Changes are live on your public trainer page.
          </p>
          <button
            onClick={() => setShowSuccess(false)}
            className="w-full rounded-xl border-2 border-black bg-black py-3 font-semibold text-white transition hover:bg-transparent hover:text-black"
          >
            Done
          </button>
        </Modal>
      )}
    </form>
  );
};

const BookingsTab = ({ bookings, refresh }) => {
  const [filter, setFilter] = useState("All");
  const [busyId, setBusyId] = useState(null);
  const filters = ["All", "Today", "Pending", "Confirmed", "Completed", "Cancelled"];

  const changeStatus = async (booking, status) => {
    setBusyId(booking._id);
    try {
      await updateBooking(booking._id, { status });
      refresh();
    } finally {
      setBusyId(null);
    }
  };

  const visible = bookings.filter((booking) =>
    filter === "All"
      ? true
      : filter === "Today"
        ? dateOf(booking.bookingDate) === todayStr()
        : booking.status === filter,
  );

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              filter === item ? "bg-black text-white" : "border border-slate-200 text-slate-600 hover:border-black"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {!visible.length && (
          <Card className="p-6 text-center text-slate-500">No bookings in this view yet.</Card>
        )}
        {visible.map((booking) => (
          <BookingRow key={booking._id} booking={booking} busyId={busyId} onStatus={changeStatus} />
        ))}
      </div>
    </>
  );
};

const ScheduleTab = ({ trainer, bookings }) => {
  const today = todayStr();
  const upcoming = bookings
    .filter((booking) => dateOf(booking.bookingDate) >= today && !["Cancelled", "Completed"].includes(booking.status))
    .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));

  const grouped = upcoming.reduce((groups, booking) => {
    const key = dateOf(booking.bookingDate);
    groups[key] = groups[key] || [];
    groups[key].push(booking);
    return groups;
  }, {});

  return (
    <>
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-900">Your weekly availability</h3>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-red-50 px-4 py-2 font-semibold text-red-600">
            Days: {(trainer.availableDays || []).join(", ") || "Not set"}
          </span>
          <span className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700">
            Hours: {trainer.availableTime?.start || "—"} – {trainer.availableTime?.end || "—"}
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-400">Update this from the “My Profile” tab.</p>
      </Card>

      <h3 className="mt-8 text-xl font-bold text-slate-900">Upcoming schedule</h3>
      {!upcoming.length ? (
        <Card className="mt-4 p-6 text-center text-slate-500">No upcoming sessions scheduled.</Card>
      ) : (
        <div className="mt-4 space-y-6">
          {Object.entries(grouped).map(([date, dayBookings]) => (
            <div key={date}>
              <p className="font-bold text-slate-900">
                {new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <div className="mt-3 space-y-3">
                {dayBookings.map((booking) => (
                  <BookingRow key={booking._id} booking={booking} busyId={null} onStatus={() => {}} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const ClientsTab = ({ clients }) => (
  <>
    {!clients.length ? (
      <EmptyState message="No clients yet. Members who book sessions with you will appear here." />
    ) : (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card key={client._id} className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-lg font-bold text-white">
              {(client.name || "M").charAt(0).toUpperCase()}
            </div>
            <p className="mt-4 font-bold text-slate-900">{client.name}</p>
            <p className="text-sm text-slate-500">{client.email}</p>
            {client.phone && <p className="text-sm text-slate-500">{client.phone}</p>}
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-slate-100 px-3 py-1">{client.totalBookings || 0} total</span>
              <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">{client.completedBookings || 0} completed</span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{client.upcomingBookings || 0} upcoming</span>
            </div>
            {client.lastBookingDate && (
              <p className="mt-3 text-xs text-slate-400">Last session: {new Date(client.lastBookingDate).toLocaleDateString()}</p>
            )}
          </Card>
        ))}
      </div>
    )}
  </>
);

const WorkoutModal = ({ plan, clients, trainerId, onClose, onSave }) => {
  const [form, setForm] = useState({
    userId: plan?.userId?._id || "",
    title: plan?.title || "",
    goal: plan?.goal || "",
    difficulty: plan?.difficulty || "Beginner",
    duration: plan?.duration || "",
    exercisesText:
      (plan?.exercises || []).map((exercise) => [exercise.name, exercise.sets, exercise.reps].filter(Boolean).join(" | ")).join("\n") || "",
  });
  const [errorText, setErrorText] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.userId || !form.title || saving) return;
    setErrorText("");
    const exercises = form.exercisesText
      .split("\n")
      .map((line) => line.split("|").map((part) => part.trim()))
      .filter(([name]) => name)
      .map(([name, sets, reps]) => ({ name, sets, reps }));
    setSaving(true);
    try {
      await onSave({
        userId: form.userId,
        trainerId,
        title: form.title,
        goal: form.goal,
        difficulty: form.difficulty,
        duration: form.duration,
        exercises,
      });
    } catch (requestError) {
      setErrorText(requestError.response?.data?.message || "Could not save this workout plan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={plan ? "Edit workout plan" : "New workout plan"} onClose={onClose}>
      {saving && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/85">
          <Loader2 size={28} className="animate-spin text-red-500" />
          <p className="text-sm font-semibold text-slate-600">{plan ? "Updating plan…" : "Creating plan…"}</p>
        </div>
      )}
      {!clients.length ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-700">
          No members yet. A member must book a session with you before you can assign plans.
        </p>
      ) : (
        <select required value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className={inputClass}>
          <option value="">Assign to member…</option>
          {clients.map((client) => (
            <option key={client._id} value={client._id}>{client.name} ({client.email})</option>
          ))}
        </select>
      )}
      <input required placeholder="Plan title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Goal (e.g. Muscle Gain)" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className={inputClass} />
        <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className={inputClass}>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </div>
      <input placeholder="Duration (e.g. 4 weeks)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputClass} />
      <label className="space-y-1">
        <span className="text-sm font-semibold text-slate-700">Exercises — one per line: Name | Sets | Reps</span>
        <textarea
          rows={5}
          placeholder={"Bench Press | 4 | 10\nSquats | 4 | 12"}
          value={form.exercisesText}
          onChange={(e) => setForm({ ...form, exercisesText: e.target.value })}
          className={inputClass}
        />
      </label>
      {errorText && <p className="text-sm font-semibold text-red-500">{errorText}</p>}
      <button onClick={submit} disabled={saving || !clients.length || !form.userId || !form.title} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-black py-3 font-semibold text-white transition hover:bg-transparent hover:text-black disabled:opacity-40">
        {saving && <Loader2 size={18} className="animate-spin" />}
        {plan ? (saving ? "Updating…" : "Update plan") : saving ? "Creating…" : "Create plan"}
      </button>
    </Modal>
  );
};

const WorkoutsTab = ({ plans, clients, trainerId, refresh }) => {
  const [modal, setModal] = useState(null);

  const remove = async (plan) => {
    if (!window.confirm(`Delete "${plan.title}"?`)) return;
    await deleteWorkout(plan._id);
    refresh();
  };

  const save = async (payload) => {
    if (modal?._id) await updateWorkout(modal._id, payload);
    else await createWorkout(payload);
    setModal(null);
    refresh();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Assigned workout plans ({plans.length})</h3>
        <button
          onClick={() => setModal({})}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-transparent hover:text-black"
        >
          <Plus size={16} /> New plan
        </button>
      </div>
      {!plans.length ? (
        <Card className="mt-4 p-6 text-center text-slate-500">No workout plans assigned yet.</Card>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan._id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-900">{plan.title}</p>
                  <p className="mt-1 text-sm text-slate-500">For {plan.userId?.name || "member"}{plan.duration ? ` · ${plan.duration}` : ""}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal(plan)} className="rounded-lg p-1.5 hover:bg-slate-100"><Pencil size={16} /></button>
                  <button onClick={() => remove(plan)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                {plan.goal && <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">{plan.goal}</span>}
                {plan.difficulty && <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{plan.difficulty}</span>}
                <span className="rounded-full bg-slate-100 px-3 py-1">{plan.exercises?.length || 0} exercises</span>
              </div>
            </Card>
          ))}
        </div>
      )}
      {modal && (
        <WorkoutModal
          key={modal._id || "new"}
          plan={modal._id ? plans.find((plan) => plan._id === modal._id) : null}
          clients={clients}
          trainerId={trainerId}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
    </>
  );
};

const DietModal = ({ plan, clients, trainerId, onClose, onSave }) => {
  const [form, setForm] = useState({
    userId: plan?.userId?._id || "",
    title: plan?.title || "",
    goal: plan?.goal || "Weight Loss",
    duration: plan?.duration || "",
    mealsText:
      (plan?.meals || []).map((meal) => [meal.mealType, (meal.foodItems || []).join(", "), meal.calories].filter(Boolean).join(" | ")).join("\n") || "",
  });
  const [errorText, setErrorText] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.userId || !form.title || saving) return;
    setErrorText("");
    const meals = form.mealsText
      .split("\n")
      .map((line) => line.split("|").map((part) => part.trim()))
      .filter(([type]) => type)
      .map(([mealType, foods, calories]) => {
        // Meal type is an enum on the backend — match any casing to a valid one.
        const matchedType = MEAL_TYPES.find((type) => type.toLowerCase() === mealType.toLowerCase());
        return {
          mealType: matchedType || mealType,
          foodItems: (foods || "").split(",").map((item) => item.trim()).filter(Boolean),
          calories: Number(calories) || 0,
        };
      });
    const invalidType = meals.find((meal) => !MEAL_TYPES.includes(meal.mealType));
    if (invalidType) {
      setErrorText(`Meal type "${invalidType.mealType}" must be one of: ${MEAL_TYPES.join(", ")}.`);
      return;
    }
    const missingFoods = meals.find((meal) => !meal.foodItems.length);
    if (missingFoods) {
      setErrorText(`${missingFoods.mealType} needs at least one food item.`);
      return;
    }
    const missingCalories = meals.find((meal) => !meal.calories);
    if (missingCalories) {
      setErrorText(`${missingCalories.mealType} is missing calories. Format: "Breakfast | Oats, milk | 350".`);
      return;
    }
    setSaving(true);
    try {
      await onSave({
        userId: form.userId,
        trainerId,
        title: form.title,
        goal: form.goal,
        duration: form.duration,
        meals,
      });
    } catch (requestError) {
      setErrorText(requestError.response?.data?.message || "Could not save this diet plan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={plan ? "Edit diet plan" : "New diet plan"} onClose={onClose}>
      {saving && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/85">
          <Loader2 size={28} className="animate-spin text-red-500" />
          <p className="text-sm font-semibold text-slate-600">{plan ? "Updating plan…" : "Creating plan…"}</p>
        </div>
      )}
      {!clients.length ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-700">
          No members yet. A member must book a session with you before you can assign plans.
        </p>
      ) : (
        <select required value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className={inputClass}>
          <option value="">Assign to member…</option>
          {clients.map((client) => (
            <option key={client._id} value={client._id}>{client.name} ({client.email})</option>
          ))}
        </select>
      )}
      <input required placeholder="Plan title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
      <div className="grid grid-cols-2 gap-4">
        <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className={inputClass}>
          {DIET_GOALS.map((goal) => <option key={goal}>{goal}</option>)}
        </select>
        <input placeholder="Duration (e.g. 30 days)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputClass} />
      </div>
      <label className="space-y-1">
        <span className="text-sm font-semibold text-slate-700">Meals — one per line: Meal | Foods (comma separated) | Calories (required)</span>
        <textarea
          rows={5}
          placeholder={"Breakfast | Oats, Milk, Banana | 350\nLunch | Chicken, Rice, Salad | 550"}
          value={form.mealsText}
          onChange={(e) => setForm({ ...form, mealsText: e.target.value })}
          className={inputClass}
        />
      </label>
      {errorText && <p className="text-sm font-semibold text-red-500">{errorText}</p>}
      <button onClick={submit} disabled={saving || !clients.length || !form.userId || !form.title} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-black py-3 font-semibold text-white transition hover:bg-transparent hover:text-black disabled:opacity-40">
        {saving && <Loader2 size={18} className="animate-spin" />}
        {plan ? (saving ? "Updating…" : "Update plan") : saving ? "Creating…" : "Create plan"}
      </button>
    </Modal>
  );
};

const DietsTab = ({ plans, clients, trainerId, refresh }) => {
  const [modal, setModal] = useState(null);

  const remove = async (plan) => {
    if (!window.confirm(`Delete "${plan.title}"?`)) return;
    await deleteDietPlan(plan._id);
    refresh();
  };

  const save = async (payload) => {
    if (modal?._id) await updateDietPlan(modal._id, payload);
    else await createDietPlan(payload);
    setModal(null);
    refresh();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Assigned diet plans ({plans.length})</h3>
        <button
          onClick={() => setModal({})}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-transparent hover:text-black"
        >
          <Plus size={16} /> New plan
        </button>
      </div>
      {!plans.length ? (
        <Card className="mt-4 p-6 text-center text-slate-500">No diet plans assigned yet.</Card>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan._id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-900">{plan.title}</p>
                  <p className="mt-1 text-sm text-slate-500">For {plan.userId?.name || "member"}{plan.duration ? ` · ${plan.duration}` : ""}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal(plan)} className="rounded-lg p-1.5 hover:bg-slate-100"><Pencil size={16} /></button>
                  <button onClick={() => remove(plan)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{plan.goal}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">{plan.meals?.length || 0} meals</span>
              </div>
            </Card>
          ))}
        </div>
      )}
      {modal && (
        <DietModal
          key={modal._id || "new"}
          plan={modal._id ? plans.find((plan) => plan._id === modal._id) : null}
          clients={clients}
          trainerId={trainerId}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
    </>
  );
};

const SessionModal = ({ option, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: option?.name || "",
    price: option?.price ?? "",
    isActive: option?.isActive ?? true,
    slotsText:
      (option?.timeSlots || []).map((slot) => `${slot.label} | ${slot.startHour}`).join("\n") || "",
  });
  const [errorText, setErrorText] = useState("");

  const submit = async () => {
    setErrorText("");
    const timeSlots = form.slotsText
      .split("\n")
      .map((line) => line.split("|").map((part) => part.trim()))
      .filter(([label]) => label)
      .map(([label, hour]) => ({ label, startHour: Number(hour) }));
    try {
      await onSave({ name: form.name, price: form.price, timeSlots, isActive: form.isActive });
    } catch (requestError) {
      setErrorText(requestError.response?.data?.message || "Could not save this session type.");
    }
  };

  return (
    <Modal title={option ? "Edit session type" : "New session type"} onClose={onClose}>
      <label className="space-y-1">
        <span className="text-sm font-semibold text-slate-700">Session name</span>
        <input required placeholder="e.g. Personal Training" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-semibold text-slate-700">Price per session (Rs.)</span>
        <input type="number" min="0" required placeholder="e.g. 1500" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-semibold text-slate-700">Time slots — one per line: Label | Start hour (0–23)</span>
        <textarea
          rows={4}
          placeholder={"Morning | 6\nEvening | 17"}
          value={form.slotsText}
          onChange={(e) => setForm({ ...form, slotsText: e.target.value })}
          className={inputClass}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
        Active — members can book this session
      </label>
      {errorText && <p className="text-sm font-semibold text-red-500">{errorText}</p>}
      <button onClick={submit} className="w-full rounded-xl border-2 border-black bg-black py-3 font-semibold text-white transition hover:bg-transparent hover:text-black">
        {option ? "Update session type" : "Create session type"}
      </button>
    </Modal>
  );
};

const SessionsTab = () => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = async () => {
    try {
      const response = await getMySessionTypes();
      setOptions(response.data?.options || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (payload) => {
    if (modal?._id) await updateMySessionType(modal._id, payload);
    else await createMySessionType(payload);
    setModal(null);
    load();
  };

  const remove = async (option) => {
    if (!window.confirm(`Delete "${option.name}"? Members will no longer be able to book it.`)) return;
    await deleteMySessionType(option._id);
    load();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Your session types</h3>
          <p className="text-sm text-slate-500">Members can only book sessions you list here.</p>
        </div>
        <button
          onClick={() => setModal({})}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-transparent hover:text-black"
        >
          <Plus size={16} /> New session type
        </button>
      </div>

      {loading ? (
        <Card className="mt-5 flex items-center justify-center p-8">
          <Loader2 size={22} className="animate-spin text-slate-400" />
        </Card>
      ) : !options.length ? (
        <Card className="mt-5 p-6 text-center text-slate-500">
          No session types yet. Create one so members can start booking you.
        </Card>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((option) => (
            <Card key={option._id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-900">{option.name}</p>
                  <p className="mt-1 text-lg font-bold text-red-500">{money(option.price)}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal(option)} className="rounded-lg p-1.5 hover:bg-slate-100"><Pencil size={16} /></button>
                  <button onClick={() => remove(option)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className={`rounded-full px-3 py-1 ${option.isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                  {option.isActive ? "Active" : "Hidden"}
                </span>
                {(option.timeSlots || []).length > 0 && (
                  <span className="rounded-full bg-slate-100 px-3 py-1">{option.timeSlots.length} slots</span>
                )}
              </div>
              {(option.timeSlots || []).length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {option.timeSlots.map((slot) => (
                    <li key={`${slot.label}-${slot.startHour}`} className="flex items-center gap-2">
                      <Clock size={13} className="text-slate-400" /> {slot.label}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <SessionModal
          key={modal._id || "new"}
          option={modal._id ? options.find((item) => item._id === modal._id) : null}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
    </>
  );
};

const EarningsTab = ({ stats, bookings }) => {
  const paid = bookings.filter((booking) => booking.paymentStatus === "Paid");
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard icon={BarChart3} label="Total earnings" value={money(stats.totalEarnings)} />
        <StatCard icon={CalendarDays} label="This month" value={money(stats.monthlyEarnings)} />
        <StatCard icon={CalendarCheck} label="Completed sessions" value={stats.completedSessions ?? 0} />
      </div>
      <Card className="mt-6 overflow-x-auto p-6">
        <h3 className="text-lg font-bold text-slate-900">Payment history</h3>
        {!paid.length ? (
          <p className="mt-4 text-sm text-slate-500">No paid sessions yet.</p>
        ) : (
          <table className="mt-4 w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-3">Date</th>
                <th className="pb-3">Member</th>
                <th className="pb-3">Method</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paid.map((booking) => (
                <tr key={booking._id}>
                  <td className="py-3 text-slate-600">{new Date(booking.updatedAt || booking.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 font-semibold text-slate-900">{booking.userId?.name || "Member"}</td>
                  <td className="py-3 capitalize text-slate-600">{booking.paymentMethod}</td>
                  <td className="py-3 text-right font-bold text-green-600">{money(booking.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
};

const ReviewsTab = ({ reviews, stats }) => (
  <>
    <Card className="flex flex-col items-center p-6 text-center">
      <p className="text-5xl font-bold text-slate-900">{stats.rating || 0}</p>
      <Stars value={Math.round(Number(stats.rating) || 0)} size={22} />
      <p className="mt-2 text-sm text-slate-500">{stats.totalReviews || 0} reviews from your members</p>
    </Card>
    {!reviews.length ? (
      <EmptyState message="No reviews yet." />
    ) : (
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {reviews.map((review) => (
          <Card key={review._id} className="p-5">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900">{review.userId?.name || "Member"}</p>
              <Stars value={review.rating} />
            </div>
            <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-600">
              <MessageSquareQuote size={16} className="mt-1 shrink-0 text-red-400" />
              {review.comment}
            </p>
            <p className="mt-3 text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
          </Card>
        ))}
      </div>
    )}
  </>
);

const TrainerDashboard = ({ data, refresh }) => {
  const [tab, setTab] = useState("Overview");
  const trainer = data?.trainer;

  if (!trainer) {
    return (
      <div className="mt-10">
        <EmptyState message="No trainer profile is linked to your account yet. Ask an admin to add you as a trainer using your account email." />
      </div>
    );
  }

  const shared = {
    bookings: data.bookings || [],
    clients: data.clients || [],
    plans: data.workoutPlans || [],
    diets: data.dietPlans || [],
    reviews: data.reviews || [],
    stats: data.stats || {},
    trainerId: trainer._id,
  };

  return (
    <section className="mt-10">
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(([label, Icon]) => (
          <button
            key={label}
            onClick={() => setTab(label)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              tab === label ? "bg-black text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-black"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "Overview" && <OverviewTab data={data} />}
        {tab === "My Profile" && <ProfileTab trainer={trainer} refresh={refresh} />}
        {tab === "Bookings" && <BookingsTab bookings={shared.bookings} refresh={refresh} />}
        {tab === "Schedule" && <ScheduleTab trainer={trainer} bookings={shared.bookings} />}
        {tab === "My Clients" && <ClientsTab clients={shared.clients} />}
        {tab === "Workouts" && <WorkoutsTab plans={shared.plans} clients={shared.clients} trainerId={shared.trainerId} refresh={refresh} />}
        {tab === "Diet Plans" && <DietsTab plans={shared.diets} clients={shared.clients} trainerId={shared.trainerId} refresh={refresh} />}
        {tab === "Sessions" && <SessionsTab />}
        {tab === "Earnings" && <EarningsTab stats={shared.stats} bookings={shared.bookings} />}
        {tab === "Reviews" && <ReviewsTab reviews={shared.reviews} stats={shared.stats} />}
      </div>
    </section>
  );
};

export default TrainerDashboard;

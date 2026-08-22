import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  Dumbbell,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  Utensils,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAdminDashboard } from "../../../api/admin.api";
import { getTrainerDashboard, getUserDashboard } from "../../../api/user.api";
import EmptyState from "../../Common/EmptyState";
import TrainerDashboard from "./trainer/TrainerDashboard";

const adminAreas = [
  ["Users", "View, search, activate, and manage users.", Users, "/admin/users"],
  [
    "Trainers",
    "Add, edit, and manage trainer availability.",
    UserRound,
    "/admin/trainers",
  ],
  [
    "Membership Plans",
    "Create and manage subscription/membership plans.",
    ShieldCheck,
    "/admin/membership-plans",
  ],
  [
    "Subscriptions",
    "Review active, expired, and cancelled subscriptions.",
    CreditCard,
    "/admin/subscriptions",
  ],
  [
    "Bookings",
    "Review pending, confirmed, and completed bookings.",
    CalendarDays,
    "/admin/bookings",
  ],
  [
    "Payments",
    "Review successful, pending, and failed payments.",
    BarChart3,
    "/admin/payments",
  ],
  ["Workout Plans", "Manage plans and exercises.", Dumbbell, "/admin/workout-plans"],
  ["Diet Plans", "Assign nutrition plans to members.", Utensils, "/admin/diet-plans"],
  [
    "Blogs",
    "Create, publish, and maintain blog content.",
    Mail,
    "/admin/blogs",
  ],
  ["Gallery", "Upload gym photos (stored on Cloudinary).", Image, "/admin/gallery"],
  ["Contacts", "Read and resolve member messages.", Mail, "/admin/contacts"],
  ["Newsletter", "See and manage newsletter subscribers.", Mail, "/admin/newsletters"],
  [
    "FAQs",
    "Manage questions, answers, and display order.",
    Settings,
    "/admin/faqs",
  ],
  [
    "Settings",
    "Update profile, password, and system settings.",
    Settings,
    "/profile",
  ],
];

const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border border-slate-200 bg-white shadow-lg shadow-red-500/15 ${className}`}
  >
    {children}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const role = storedUser?.role || "user";
  const isAdmin = role === "admin";
  const isTrainer = role === "trainer";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(() => {
    // Load a role-specific dashboard from protected backend APIs.
    const request = isAdmin
      ? getAdminDashboard()
      : isTrainer
        ? getTrainerDashboard()
        : getUserDashboard();
    return request
      .then((response) => {
        setData(response.data?.dashboard);
        setError("");
      })
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message || "Could not load dashboard.",
        ),
      );
  }, [isAdmin, isTrainer]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const user = data?.user || storedUser;
  const upcomingBooking = useMemo(
    () =>
      data?.bookings?.find(
        (booking) =>
          new Date(booking.bookingDate) >= new Date() &&
          booking.status !== "Cancelled",
      ),
    [data],
  );
  const activeMembership = data?.subscriptions?.find(
    (subscription) => subscription.status === "Active",
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Dashboard header and session controls */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-red-500">
              <LayoutDashboard size={17} />{" "}
              {isAdmin ? "Admin dashboard" : isTrainer ? "Trainer dashboard" : "User dashboard"}
            </p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">
              Welcome, {user?.name || "Athlete"}.
            </h1>
            <p className="mt-2 text-slate-600">
              {isAdmin
                ? "A clear view of what is happening at ApexFit."
                : isTrainer
                  ? "Your sessions, members, and assigned plans in one place."
                  : "Your training, bookings, and progress in one place."}
            </p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 self-start rounded-xl border-2 border-black bg-black px-4 py-3 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-transparent hover:text-black"
          >
            <LogOut size={18} /> Logout
          </button>
        </header>
        {error && <EmptyState message={error} />}

        {isAdmin ? (
          <section className="mt-10">
            {/* Admin overview metrics */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["totalUsers", "Total Users", Users],
                ["totalTrainers", "Total Trainers", UserRound],
                ["activeSubscriptions", "Active Memberships", ShieldCheck],
                ["totalBookings", "Total Bookings", CalendarDays],
                ["totalRevenue", "Total Revenue", BarChart3],
              ].map(([key, label, Icon]) => (
                <Card key={key} className="p-5">
                  <Icon className="text-red-500" size={21} />
                  <p className="mt-5 text-2xl font-bold text-slate-900">
                    {key === "totalRevenue"
                      ? `Rs. ${data?.[key] || 0}`
                      : (data?.[key] ?? "—")}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{label}</p>
                </Card>
              ))}
            </div>
            <Card className="mt-6 p-6">
              <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="rounded-full bg-amber-50 px-4 py-2">
                  {data?.pendingBookings || 0} pending bookings
                </span>
                <span className="rounded-full bg-amber-50 px-4 py-2">
                  {data?.pendingPayments || 0} pending payments
                </span>
                <span className="rounded-full bg-red-50 px-4 py-2">
                  {data?.failedPayments || 0} failed payments
                </span>
                <span className="rounded-full bg-green-50 px-4 py-2">
                  Rs. {data?.totalRevenue || 0} revenue
                </span>
              </div>
            </Card>
            {/* Admin management areas */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {adminAreas.map(([title, description, Icon, path]) => (
                <button
                  key={title}
                  onClick={() => navigate(path)}
                  className="text-left"
                >
                  <Card className="h-full p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/25">
                    <Icon className="text-red-500" />
                    <h2 className="mt-5 text-xl font-bold text-slate-900">
                      {title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {description}
                    </p>
                  </Card>
                </button>
              ))}
            </div>
          </section>
        ) : isTrainer ? (
          <TrainerDashboard data={data} refresh={loadDashboard} />
        ) : (
          <section className="mt-10">
            {/* User overview: membership, booking, and total activity */}
            <div className="grid gap-5 md:grid-cols-3">
              <Card className="p-6">
                <ShieldCheck className="text-red-500" />
                <p className="mt-5 text-2xl font-bold">
                  {activeMembership ? "Active" : "None"}
                </p>
                <p className="mt-1 text-sm text-slate-500">Membership status</p>
              </Card>
              <Card className="p-6">
                <CalendarDays className="text-red-500" />
                <p className="mt-5 text-2xl font-bold">
                  {upcomingBooking
                    ? new Date(upcomingBooking.bookingDate).toLocaleDateString()
                    : "—"}
                </p>
                <p className="mt-1 text-sm text-slate-500">Upcoming booking</p>
              </Card>
              <Card className="p-6">
                <BarChart3 className="text-red-500" />
                <p className="mt-5 text-2xl font-bold">
                  {data?.bookings?.length || 0}
                </p>
                <p className="mt-1 text-sm text-slate-500">Total bookings</p>
              </Card>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <button onClick={() => navigate("/booking")}>
                <Card className="p-6 text-left transition hover:-translate-y-1">
                  <CalendarDays className="text-red-500" />
                  <h2 className="mt-4 font-bold">Book a session</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Choose a trainer and time.
                  </p>
                </Card>
              </button>
              <button onClick={() => navigate("/my-bookings")}>
                <Card className="p-6 text-left transition hover:-translate-y-1">
                  <CalendarCheck className="text-red-500" />
                  <h2 className="mt-4 font-bold">My bookings</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Edit, cancel, or delete sessions.
                  </p>
                </Card>
              </button>
              <button onClick={() => navigate("/workouts")}>
                <Card className="p-6 text-left transition hover:-translate-y-1">
                  <Dumbbell className="text-red-500" />
                  <h2 className="mt-4 font-bold">My workouts</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {data?.workoutPlans?.length || 0} plans available.
                  </p>
                </Card>
              </button>
              <button onClick={() => navigate("/dietplans")}>
                <Card className="p-6 text-left transition hover:-translate-y-1">
                  <Utensils className="text-red-500" />
                  <h2 className="mt-4 font-bold">My diet plans</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {data?.dietPlans?.length || 0} nutrition plans.
                  </p>
                </Card>
              </button>
            </div>
            <Card className="mt-8 p-6">
              <h2 className="text-xl font-bold">Upcoming booking</h2>
              {upcomingBooking ? (
                <p className="mt-3 text-slate-600">
                  {new Date(upcomingBooking.bookingDate).toLocaleDateString()} ·{" "}
                  {upcomingBooking.timeSlot} with{" "}
                  {upcomingBooking.trainerId?.fullName || "your trainer"}
                </p>
              ) : (
                <p className="mt-3 text-slate-500">No upcoming bookings yet.</p>
              )}
            </Card>
          </section>
        )}
      </div>
    </main>
  );
};

export default Dashboard;

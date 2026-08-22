import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { CalendarDays, LayoutDashboard, LogOut, Menu, X } from "lucide-react";

const Navbar = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null"),
  );

  const location = useLocation();

  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const isAdmin = currentUser?.role === "admin";
  const isTrainer = currentUser?.role === "trainer";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setMenuOpen(false);
    window.location.href = "/login";
  };

  // Show navbar after scrolling
  useEffect(() => {
    const handleScroll = () => {
      setShowNavbar(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Re-read the saved session after every navigation so logging in,
    // registering, or logging out inside this tab updates immediately
    // (the "storage" event below only fires for other tabs).
    const syncUser = () => setCurrentUser(JSON.parse(localStorage.getItem("user") || "null"));
    syncUser();
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, [location.pathname]);

  const displayName =
    currentUser?.name ||
    currentUser?.email?.split("@")[0] ||
    "Member";

  const navLinks = [
    { name: "About", path: "/about" },
    { name: "Trainers", path: "/trainers" },
    { name: "Membership", path: "/membership" },
    { name: "Book Session", path: "/booking" },
    { name: "Workout Plans", path: "/workouts" },
    { name: "Diet Plans", path: "/dietplans" },
    { name: "Gallery", path: "/gallery" },
    { name: "Blog", path: "/blogs" },
    { name: "Contact", path: "/contact" },
  ];

  // Hide navbar on authentication pages
  const hiddenRoutes = [
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
  ];

  const isHiddenRoute =
    hiddenRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password/");

  if (isHiddenRoute) return null;

  const linkClass = ({ isActive }) =>
    `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? "bg-[#27253F] text-white"
        : "text-gray-600 hover:bg-gray-100 hover:text-[#27253F]"
    }`;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 
      transition-all duration-300
      ${
        showNavbar
          ? "translate-y-0 bg-white shadow-lg"
          : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <NavLink
          to="/"
          className="shrink-0 text-[#27253F] text-2xl sm:text-3xl font-serif font-bold"
        >
          ApexFit
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={linkClass}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Desktop Auth + Mobile Menu */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Desktop session greeting and actions */}
          {isLoggedIn ? (
            <div className="hidden items-center gap-2 lg:flex">
              <p className="max-w-36 truncate px-1 text-sm text-gray-600">Hi, <span className="font-bold text-[#27253F]">{displayName}</span></p>
              <NavLink to={isAdmin ? "/admin/dashboard" : "/dashboard"} className={({ isActive }) => `inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-white transition ${isActive ? "ring-2 ring-offset-1 ring-[#27253F]" : ""} ${isAdmin ? "bg-red-600 hover:bg-red-700" : isTrainer ? "bg-indigo-600 hover:bg-indigo-700" : "bg-[#27253F] hover:bg-[#3A375C]"}`}>
                <LayoutDashboard size={16} /> {isAdmin ? "Admin" : isTrainer ? "Trainer" : "User"}
              </NavLink>
              <NavLink to="/my-bookings" className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-[#27253F] text-white" : "text-[#27253F] hover:bg-gray-100"}`}>My Bookings</NavLink>
              <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1 rounded-lg border border-[#27253F] px-3 py-2 text-sm font-semibold text-[#27253F] transition hover:bg-[#27253F] hover:text-white"><LogOut size={16} /> Logout</button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <NavLink to="/login" className="rounded-sm border border-[#27253F] px-3 py-2 text-sm font-semibold text-[#27253F] transition hover:bg-[#27253F] hover:text-white">Login</NavLink>
              <NavLink to="/register" className="rounded-sm bg-[#27253F] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#3A375C]">Sign Up</NavLink>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            {menuOpen ? <X size={30} /> : <Menu size={30} />}
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-[calc(100vh-5rem)] overflow-y-auto" : "max-h-0"
        } bg-white`}
      >
        <div className="flex flex-col px-4 sm:px-6 py-5 gap-2 border-t border-gray-100">

          {/* Mobile Navigation Links */}
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={linkClass}
            >
              {link.name}
            </NavLink>
          ))}

          {/* Mobile Auth Buttons */}
          <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
            {isLoggedIn ? (
              <>
                <div className="w-full"><p className="text-sm text-gray-600">Hi, <span className="font-bold text-[#27253F]">{displayName}</span>{isAdmin ? " · Admin" : isTrainer ? " · Trainer" : ""}</p></div>
                <NavLink to={isAdmin ? "/admin/dashboard" : "/dashboard"} onClick={() => setMenuOpen(false)} className={({ isActive }) => `inline-flex w-full items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition ${isActive ? "ring-2 ring-offset-1 ring-[#27253F]" : ""} ${isAdmin ? "bg-red-600 hover:bg-red-700" : isTrainer ? "bg-indigo-600 hover:bg-indigo-700" : "bg-[#27253F] hover:bg-[#3A375C]"}`}><LayoutDashboard size={17} /> {isAdmin ? "Admin Dashboard" : isTrainer ? "Trainer Dashboard" : "User Dashboard"}</NavLink>
                <NavLink to="/my-bookings" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-2 rounded-sm border border-[#27253F] px-4 py-2 font-semibold text-[#27253F]"><CalendarDays size={17} /> My Bookings</NavLink>
                <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-sm bg-[#27253F] px-4 py-2 font-semibold text-white"><LogOut size={17} /> Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setMenuOpen(false)} className="rounded-sm border border-[#27253F] px-5 py-2 text-[#27253F]">Login</NavLink>
                <NavLink to="/register" onClick={() => setMenuOpen(false)} className="rounded-sm bg-[#27253F] px-5 py-2 text-white">Sign Up</NavLink>
              </>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import Footer from "./Component/Layout/Footer";
import Navbar from "./Component/Layout/Navbar";
import AppRoutes from "./Component/Routes/AppRoutes";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Routes that exist in the app. Anything else is a 404,
// which renders without navbar/footer.
const KNOWN_ROUTES = [
  "/",
  "/about",
  "/trainers",
  "/register",
  "/login",
  "/verify-otp",
  "/forgot-password",
  "/payment-form",
  "/payment-success",
  "/payment-failed",
  "/membership",
  "/booking",
  "/my-bookings",
  "/workouts",
  "/gallery",
  "/blogs",
  "/dashboard",
  "/admin",
  "/profile",
  "/contact",
  "/dietplans",
];

const PREFIX_ROUTES = ["/reset-password/"];

const isKnownRoute = (pathname) =>
  KNOWN_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(`${route}/`),
  ) || PREFIX_ROUTES.some((prefix) => pathname.startsWith(prefix));

function App() {
  const { pathname } = useLocation();
  const showChrome = isKnownRoute(pathname);

  return (
    <>
      <ScrollToTop />
      {showChrome && <Navbar />}
      <AppRoutes />
      {showChrome && <Footer />}
    </>
  );
}

export default App;

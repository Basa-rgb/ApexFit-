import React, { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  X,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { subscribeNewsletter } from "../../api/newsletter.api";
import { useLoginGate } from "../Common/LoginPrompt";

const Footer = () => {
  const location = useLocation();
  const [newsForm, setNewsForm] = useState({ email: "" });
  const [newsStatus, setNewsStatus] = useState({ loading: false, message: "", error: false });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { isLoggedIn, requireLogin, loginPrompt } = useLoginGate();

  const handleSubscribe = async (event) => {
    event.preventDefault();
    if (!isLoggedIn) {
      requireLogin();
      return;
    }
    setNewsStatus({ loading: true, message: "", error: false });
    try {
      await subscribeNewsletter({ email: newsForm.email });
      setNewsForm({ email: "" });
      setNewsStatus({ loading: false, message: "", error: false });
      setShowSuccessModal(true);
    } catch (error) {
      setNewsStatus({ loading: false, message: error.response?.data?.message || "Could not subscribe.", error: true });
    }
  };
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

  return (
    <footer className="bg-gray-200 text-gray-900 shadow-[0_-10px_30px_rgba(220,38,38,0.5)]">
      {/* Newsletter signup */}
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-300 bg-white p-6 shadow-lg shadow-red-500/15 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-red-500">
                <Mail size={16} /> Newsletter
              </p>
              <h3 className="mt-2 text-xl font-bold sm:text-2xl">
                Get fitness tips &amp; offers in your inbox
              </h3>
              <p className="mt-1 text-sm">
                Weekly workout ideas, diet tips, and member-only discounts. No spam, ever.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="w-full max-w-md space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={newsForm.email}
                  onChange={(e) => setNewsForm({ email: e.target.value })}
                  placeholder="Enter your email address"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#27253F]"
                />
                <button
                  type="submit"
                  disabled={newsStatus.loading}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-transparent hover:text-black disabled:opacity-60"
                >
                  {newsStatus.loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                  Subscribe
                </button>
              </div>
              {newsStatus.message && (
                <p className={`text-sm font-medium ${newsStatus.error ? "text-red-600" : "text-green-700"}`}>
                  {newsStatus.message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Popup asking guests to log in before subscribing */}
      {loginPrompt}

      {/* Success popup after subscribing */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl shadow-red-500/30">
            <button type="button" onClick={() => setShowSuccessModal(false)} aria-label="Close confirmation" className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
              <X size={20} />
            </button>
            <CheckCircle2 className="mx-auto text-green-600" size={58} />
            <h3 className="mt-5 text-2xl font-bold text-slate-900">Subscribed successfully!</h3>
            <p className="mt-3 leading-7 text-slate-600">You are on the list. Fitness tips, workout ideas, and member-only offers are on their way to your inbox.</p>
            <button type="button" onClick={() => setShowSuccessModal(false)} className="mt-6 rounded-xl border-2 border-black bg-black px-6 py-3 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-transparent hover:text-black">
              Done
            </button>
          </div>
        </div>
      )}

      {/* Footer brand, social links, navigation, programs, and contact details */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Brand introduction and social media links */}
        <div>
          <Link to="/" className="text-3xl font-bold tracking-tight">
            ApexFit
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-7">
            Your destination for strength, fitness, and a healthier lifestyle.
            Train harder, stay motivated, and become your best self.
          </p>
          <div className="mt-6 flex gap-4">
            <a
              href="https://facebook.com"
              aria-label="Facebook"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1 rounded-full text-blue-600 transition duration-300 hover:scale-110"
            >
              <span className="rounded-full bg-blue-100 p-3">
                <FaFacebook size={28} />
              </span>
              <span className="text-xs font-medium">Facebook</span>
            </a>
            <a
              href="https://instagram.com"
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1 rounded-full text-pink-600 transition  duration-300 hover:scale-110"
            >
              <span className="rounded-full bg-pink-100 p-3">
                <FaInstagram size={28} />
              </span>
              <span className="text-xs font-medium">Instagram</span>
            </a>
            <a
              href="https://linkedin.com"
              aria-label="LinkedIn"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1 rounded-full text-blue-700 transition  duration-300 hover:scale-110"
            >
              <span className="rounded-full bg-blue-100 p-3">
                <FaLinkedin size={28} />
              </span>
              <span className="text-xs font-medium">LinkedIn</span>
            </a>
          </div>
        </div>

        {/* Main website navigation */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest">
            Explore
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              ["Home", "/"],
              ["About", "/about"],
              ["Trainers", "/trainers"],
              ["Membership", "/membership"],
            ].map(([name, path]) => (
              <li key={path}>
                <Link
                  to={path}
                  className="flex items-center gap-1 transition hover:translate-x-1"
                >
                  <ChevronRight size={15} />
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Available fitness programs */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest">
            Programs
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link to="/workouts" className="transition">
                Workout plans
              </Link>
            </li>
            <li>
              <Link to="/booking" className="transition">
                Personal training
              </Link>
            </li>
            <li>
              <Link to="/trainers" className="transition">
                Find a trainer
              </Link>
            </li>
            <li>
              <Link to="/membership" className="transition">
                Membership plans
              </Link>
            </li>
          </ul>
        </div>

        {/* Gym location and contact information */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest">
            Contact us
          </h3>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <MapPin size={18} />
              <span>Kathmandu, Nepal</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} />
              <a href="tel:+9779749328435">+977 9749328435</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} />
              <a href="mailto:basantan109@gmail.com">basantan109@gmail.com</a>
            </li>
            <li className="flex items-center gap-3">
              <Clock size={18} />
              <span>6:00 AM – 9:00 PM</span>
            </li>
            <li className="flex items-center gap-3">
              <CalendarDays size={18} />
              <span>Open 7 days a week</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright and closing footer message */}
      <div className="border-t border-gray-300 px-4 py-5 text-center text-sm">
        © 2026 ApexFit. Built for a stronger you.
      </div>
    </footer>
  );
};

export default Footer;

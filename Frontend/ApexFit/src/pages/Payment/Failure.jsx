import React from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { XCircle, RefreshCcw, Home } from "lucide-react";

const Failure = () => {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const data = new URLSearchParams(location.search).get("data");
    if (!data) return;

    try {
      const decoded = JSON.parse(atob(data.replace(/-/g, "+").replace(/_/g, "/")));
      if (decoded?.transaction_uuid) {
        const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/?$/, "");
        axios.post(`${apiBase}/esewa/payment-status`, {
          data,
          product_id: decoded.transaction_uuid,
        }).catch((error) => console.error("Could not record failed payment:", error));
      }
    } catch (error) {
      console.error("Could not decode failed eSewa response:", error);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-rose-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center">

        {/* Failure Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle
              size={70}
              className="text-red-600"
              strokeWidth={2.2}
            />
          </div>
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-3xl font-bold text-gray-800">
          Payment Failed
        </h1>

        {/* Description */}
        <p className="mt-4 text-gray-500 leading-relaxed">
          Unfortunately, we couldn't process your payment.
          <br />
          Please verify your payment details and try again.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-4">

          <button
            onClick={() => navigate(-1)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          >
            <RefreshCcw size={18} />
            Try Again
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:bg-gray-100 cursor-pointer"
          >
            <Home size={18} />
            Go to Homepage
          </button>

        </div>

        {/* Footer */}
        <p className="mt-8 text-sm text-gray-400 ">
          If money was deducted from your account, it will usually be
          refunded automatically according to your payment provider's
          policy.
        </p>
      </div>
    </div>
  );
};

export default Failure;
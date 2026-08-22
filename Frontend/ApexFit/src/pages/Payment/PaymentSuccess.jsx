import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle2,
  Home,
  LoaderCircle,
  Receipt,
} from "lucide-react";

  const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/?$/, "");

const decodeEsewaData = (encodedData) => {
  const normalized = encodedData.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  return JSON.parse(atob(padded));
};

const Success = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("data");

  const decoded = useMemo(() => {
    try {
      return token ? decodeEsewaData(token) : null;
    } catch (error) {
      console.error("Could not decode eSewa response:", error);
      return null;
    }
  }, [token]);

  const verifyPaymentAndUpdateStatus = useCallback(async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/esewa/payment-status`,
        {
          data: token,
          product_id: decoded.transaction_uuid,
        }
      );

      if (response.data?.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(response.data?.message || "Payment is not complete yet.");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Could not reach the payment verifier. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [decoded, token]);

  useEffect(() => {
    if (decoded) {
      verifyPaymentAndUpdateStatus();
    } else {
      setIsLoading(false);
    }
  }, [decoded, verifyPaymentAndUpdateStatus]);

  // Loading UI
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-white to-emerald-100 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-sm w-full">
          <LoaderCircle className="animate-spin text-green-600 mx-auto" size={60} />
          <h2 className="mt-6 text-2xl font-semibold text-gray-800">
            Verifying Payment...
          </h2>
          <p className="mt-2 text-gray-500">
            Please wait while we confirm your transaction.
          </p>
        </div>
      </div>
    );
  }

  // Error UI
  if (!isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 via-white to-rose-100 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
          <h1 className="text-3xl font-bold text-red-600">
            Verification Failed
          </h1>

          <p className="mt-4 text-gray-500">
            We couldn't verify your payment.
            <br />
            Please contact support if the payment was deducted.
          </p>
          {errorMessage && (
            <p className="mt-3 text-sm text-red-500">{errorMessage}</p>
          )}

          <button
            onClick={() => navigate("/")}
            className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition duration-300"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Success UI
  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center">

        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2
              size={70}
              className="text-green-600"
              strokeWidth={2.2}
            />
          </div>
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-3xl font-bold text-gray-800">
          Payment Successful!
        </h1>

        {/* Description */}
        <p className="mt-4 text-gray-500 leading-relaxed">
          Thank you! Your payment has been successfully completed.
          Your booking has been confirmed.
        </p>

        {/* Transaction ID */}
        {decoded?.transaction_uuid && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="text-green-600" size={20} />
              <span className="font-semibold text-gray-700">
                Transaction ID
              </span>
            </div>

            <p className="text-sm text-gray-600 break-all">
              {decoded.transaction_uuid}
            </p>
          </div>
        )}

        {/* Home Button */}
        <button
          onClick={() => navigate("/")}
          className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
        >
          <Home size={18} />
          Go to Homepage
        </button>

        {/* Footer */}
        <p className="mt-8 text-sm text-gray-400">
          A confirmation has been recorded successfully. Thank you for choosing us.
        </p>
      </div>
    </div>
  );
};

export default Success;

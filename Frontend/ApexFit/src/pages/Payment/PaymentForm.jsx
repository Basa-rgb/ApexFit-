import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Wallet,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { useLoginGate } from "../../Component/Common/LoginPrompt";
import api from "../../api/axios";

const generateProductId = () =>
  `apexfit-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const submitEsewaForm = (gatewayUrl, formData) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = gatewayUrl;

  Object.entries(formData).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
};

const PaymentForm = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { isLoggedIn, requireLogin, loginPrompt } = useLoginGate();

  const membershipPlanId =
    searchParams.get("membershipPlanId") || searchParams.get("planId");
  const isMembershipPayment = Boolean(membershipPlanId);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    if (!isMembershipPayment && (!amount || Number(amount) <= 0)) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);

      const payload = isMembershipPayment
        ? { membershipPlanId }
        : {
            amount: Number(amount),
            productId: generateProductId(),
          };

      const response = await api.post(
        "/esewa/initiate-payment",
        payload,
      );

      if (!response.data?.gatewayUrl || !response.data?.formData) {
        throw new Error("eSewa payment details were not returned.");
      }

      // eSewa requires the customer's browser to POST the signed form data.
      submitEsewaForm(response.data.gatewayUrl, response.data.formData);
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert(
        error.response?.data?.message ||
          "Failed to initiate payment. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-green-600 p-8 text-center">
          <div className="flex justify-center">
            <div className="bg-white/20 p-4 rounded-full">
              <Wallet size={42} className="text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mt-4">
            {isMembershipPayment ? "Membership Payment" : "eSewa Payment"}
          </h1>

          <p className="text-green-100 mt-2">
            Fast, secure and trusted online payment
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handlePayment}
          className="p-8 space-y-6"
        >
          {!isMembershipPayment && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Payment Amount (NPR)
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">
                  Rs.
                </span>

                <input
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-start gap-3 bg-green-50 p-4 rounded-xl border border-green-100">
            <ShieldCheck
              className="text-green-600 mt-1"
              size={20}
            />

            <div>
              <h4 className="font-semibold text-gray-700">
                Secure Payment
              </h4>

              <p className="text-sm text-gray-500">
                Your payment will be securely processed through
                eSewa's encrypted payment gateway.
              </p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold flex justify-center items-center gap-2 transition duration-300 ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 hover:scale-[1.02]"
            }`}
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={20} />
                Redirecting...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                Pay with eSewa
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-400">
            By clicking the button, you will be redirected to the
            official eSewa payment gateway.
          </p>
        </form>
      </div>

      {/* Popup when a guest somehow reaches the payment page. */}
      {loginPrompt}
    </div>
  );
};

export default PaymentForm;

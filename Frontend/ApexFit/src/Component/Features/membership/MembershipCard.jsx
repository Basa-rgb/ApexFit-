import React, { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { initiateEsewaPayment } from "../../../api/esewa.api";

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
const MembershipCard = ({ membership }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    _id,
    name,
    price,
    duration,
    description,
    features = [],
    planType,
  } = membership;

  const isPopular = planType === "Standard";

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      const response = await initiateEsewaPayment({
        membershipPlanId: _id,
      });

      if (!response.data?.gatewayUrl || !response.data?.formData) {
        throw new Error(
          response.data?.message || "Could not start the eSewa payment.",
        );
      }

      submitEsewaForm(response.data.gatewayUrl, response.data.formData);
    } catch (error) {
      console.error("eSewa payment error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Could not start the eSewa payment. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div
        className={`relative flex flex-col justify-between rounded-2xl p-8 transition-all  shadow-red-300 duration-300 hover:-translate-y-1.5 ${
          isPopular
            ? "bg-slate-900 text-white shadow-2xl ring-2 ring-indigo-500 hover:shadow-indigo-500/10"
            : "bg-white text-slate-800 shadow-md hover:shadow-xl border border-slate-100"
        }`}
      >
        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Most Popular
          </div>
        )}

        {/* Header & Pricing */}
        <div>
          <h2
            className={`text-center font-serif text-2xl font-bold tracking-tight ${isPopular ? "text-white" : "text-slate-900"}`}
          >
            {name}
          </h2>

          {/* Pricing Layout */}
          <div className="my-6 text-center">
            <span className="text-4xl font-extrabold tracking-tight">
              Rs. {price}
            </span>

            <span
              className={`text-sm font-medium ${
                isPopular ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {" "}
              / {duration} Month
            </span>
          </div>

          <p
            className={`text-center text-sm leading-relaxed mb-6 ${isPopular ? "text-slate-300" : "text-slate-600"}`}
          >
            {description}
          </p>

          <hr
            className={`my-6 ${isPopular ? "border-slate-800" : "border-slate-100"}`}
          />

          {/* Feature List */}
          <ul className="space-y-3.5">
            {features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm leading-tight"
              >
                <span
                  className={`rounded-full p-1 mt-0.5 ${isPopular ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-50 text-emerald-600"}`}
                >
                  <Check className="w-4 h-4" />
                </span>
                <span
                  className={isPopular ? "text-slate-200" : "text-slate-700"}
                >
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Call to Action */}
        <div className="mt-8">
          <button
            type="button"
            disabled={isLoading}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
              isPopular
                ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-sm active:scale-[0.98]"
            } disabled:cursor-not-allowed disabled:opacity-60`}
            onClick={handlePayment}
          >
            {isLoading ? "Redirecting..." : "Subscribe Now"}
          </button>
        </div>
      </div>
    </>
  );
};

export default MembershipCard;

import React, { useEffect, useState, useMemo } from "react";
import {
  XCircle,
  Loader2,
  CalendarDays,
  Clock,
  Dumbbell,
  NotebookPen,
  Wallet,
} from "lucide-react";
import { createBooking, getBookingOptions } from "../../../api/booking.api";
import { initiateEsewaPayment } from "../../../api/esewa.api";
import { getAllTrainers } from "../../../api/trainer.api";
import EmptyState from "../../Common/EmptyState";
import { useLoginGate } from "../../Common/LoginPrompt";

const INITIAL_FORM = {
  bookingDate: "",
  timeSlot: "",
  bookingOptionId: "",
  notes: "",
  paymentMethod: "eSewa",
};

const parseTimeToHour = (time) => {
  if (typeof time === "number") return time;

  const value = String(time || "").trim().toUpperCase();
  const match = value.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/);
  if (!match) return null;

  let hour = Number(match[1]);
  const minutes = Number(match[2] || 0);
  if (minutes > 0) hour += minutes / 60;
  if (match[3] === "PM" && hour < 12) hour += 12;
  if (match[3] === "AM" && hour === 12) hour = 0;
  return hour;
};

const formatHour = (hour) => {
  const normalizedHour = Number(hour) % 24;
  const suffix = normalizedHour >= 12 ? "PM" : "AM";
  const displayHour = normalizedHour % 12 || 12;
  return `${String(displayHour).padStart(2, "0")}:00 ${suffix}`;
};

const getSlotStartHour = (slot) => {
  let hour = Number(slot.startHour);
  const period = String(slot.label || "").toLowerCase();

  if ((period.includes("afternoon") || period.includes("evening")) && hour < 12) {
    hour += 12;
  }

  return hour;
};

const getSlotLabel = (slot) =>
  Number.isFinite(Number(slot.startHour))
    ? `${formatHour(getSlotStartHour(slot))} - ${formatHour(getSlotStartHour(slot) + 1)}`
    : slot.label;

// eSewa requires the browser to POST the signed form data directly to the gateway
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

const BookingForm = ({ trainerId }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState(trainerId || "");
  const [trainersLoading, setTrainersLoading] = useState(true);
  const [trainersError, setTrainersError] = useState("");
  const [bookingOptions, setBookingOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });
  const { isLoggedIn, requireLogin, loginPrompt } = useLoginGate();

  useEffect(() => {
    setSelectedTrainerId(trainerId || "");
  }, [trainerId]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, bookingOptionId: "", timeSlot: "" }));
  }, [selectedTrainerId]);

  useEffect(() => {
    const fetchBookingOptions = async () => {
      if (!selectedTrainerId) {
        setBookingOptions([]);
        setOptionsLoading(false);
        return;
      }

      setOptionsLoading(true);
      try {
        const response = await getBookingOptions(selectedTrainerId);
        setBookingOptions(response.data?.options || []);
      } catch (error) {
        setOptionsError(
          error.response?.data?.message || "Could not load booking options."
        );
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchBookingOptions();
  }, [selectedTrainerId]);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await getAllTrainers();
        const databaseTrainers = response.data?.trainer || [];
        setTrainers(databaseTrainers);

        // Do not keep a profile URL selection if that trainer is no longer active.
        if (
          trainerId &&
          !databaseTrainers.some((trainer) => trainer._id === trainerId)
        ) {
          setSelectedTrainerId("");
        }
      } catch (error) {
        setTrainersError(
          error.response?.data?.message || "Could not load trainers."
        );
      } finally {
        setTrainersLoading(false);
      }
    };

    fetchTrainers();
  }, [trainerId]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    []
  );

  const selectedOption = bookingOptions.find(
    (option) => option._id === formData.bookingOptionId
  );
  const selectedTrainer = trainers.find(
    (trainer) => trainer._id === selectedTrainerId
  );
  const sessionPrice = selectedOption?.price || 0;

  // Book button only turns on once every required field has a value
  const isFormValid =
    !!selectedTrainerId &&
    !!formData.bookingDate &&
    !!formData.timeSlot &&
    !!formData.bookingOptionId;

  // Filter out time slots that have already passed for today
  const availableSlots = useMemo(() => {
    const optionSlots = selectedOption?.timeSlots || [];
    const trainerStart = parseTimeToHour(selectedTrainer?.availableTime?.start);
    const trainerEnd = parseTimeToHour(selectedTrainer?.availableTime?.end);
    const selectedDate = formData.bookingDate
      ? new Date(`${formData.bookingDate}T00:00:00`)
      : null;
    const selectedDay = selectedDate?.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const trainerSlots = optionSlots.filter((slot) => {
      const slotStart = getSlotStartHour(slot);
      const slotEnd = slotStart + 1;
      const withinTime =
        trainerStart === null ||
        trainerEnd === null ||
        (slotStart >= trainerStart && slotEnd <= trainerEnd);
      const withinDay =
        !selectedTrainer?.availableDays?.length ||
        selectedTrainer.availableDays.includes(selectedDay);
      return withinTime && withinDay;
    });

    if (formData.bookingDate !== todayStr) return trainerSlots;

    const currentHour = new Date().getHours();
    return trainerSlots.filter((slot) => getSlotStartHour(slot) > currentHour);
  }, [formData.bookingDate, selectedOption, selectedTrainer, todayStr]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset time slot if date changes to avoid invalid slot selection
    if (name === "bookingDate") {
      setFormData((prev) => ({ ...prev, bookingDate: value, timeSlot: "" }));
    } else if (name === "bookingOptionId") {
      setFormData((prev) => ({ ...prev, bookingOptionId: value, timeSlot: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear feedback message on edit
    if (status.error || status.success) {
      setStatus((prev) => ({ ...prev, error: "", success: "" }));
    }
  };

  const handleTrainerChange = (e) => {
    setSelectedTrainerId(e.target.value);
    setFormData((prev) => ({ ...prev, timeSlot: "" }));
    if (status.error || status.success) {
      setStatus((prev) => ({ ...prev, error: "", success: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    if (!selectedTrainerId) {
      setStatus({ loading: false, error: "Please select a trainer first.", success: "" });
      return;
    }

    try {
      setStatus({ loading: true, error: "", success: "" });

      const bookingRes = await createBooking({
        trainerId: selectedTrainerId,
        bookingOptionId: formData.bookingOptionId,
        bookingDate: formData.bookingDate,
        timeSlot: formData.timeSlot,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
      });

      // Adjust this to match whatever field your API returns the new booking on
      const booking = bookingRes.data?.booking || bookingRes.data?.data;

      if (!bookingRes.data?.success || !booking?._id) {
        throw new Error(bookingRes.data?.message || "Could not create booking.");
      }

      if (formData.paymentMethod === "Cash") {
        setStatus({
          loading: false,
          error: "",
          success: "Booking created. Please pay cash at the gym.",
        });
        setFormData(INITIAL_FORM);
        return;
      }

      const paymentRes = await initiateEsewaPayment({ bookingId: booking._id });

      if (!paymentRes.data?.gatewayUrl || !paymentRes.data?.formData) {
        throw new Error("Could not start payment.");
      }

      // Bridges context across the eSewa redirect so Success.jsx knows
      // this payment was for a booking, not a membership
      localStorage.setItem(
        "pendingPayment",
        JSON.stringify({ type: "booking", bookingId: booking._id })
      );

      submitEsewaForm(paymentRes.data.gatewayUrl, paymentRes.data.formData);
    } catch (err) {
      console.error("Booking error:", err);
      setStatus({
        loading: false,
        success: "",
        error:
          err.response?.data?.message || err.message || "Failed to create booking.",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 transition-all"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Book a Session
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Select your preferred schedule and session details below.
        </p>
      </div>

      {/* Trainer — loaded from the database */}
      <div className="mb-5">
        <label
          htmlFor="trainerId"
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"
        >
          <Dumbbell className="w-4 h-4 text-gray-400" />
          Choose Trainer
        </label>
        <select
          id="trainerId"
          name="trainerId"
          value={selectedTrainerId}
          onChange={handleTrainerChange}
          required
          disabled={trainersLoading || trainers.length === 0}
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-800 transition focus:border-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <option value="">
            {trainersLoading
              ? "Loading trainers..."
              : trainers.length === 0
                ? "No trainers available"
                : "Select a trainer"}
          </option>
          {trainers.map((trainer) => (
            <option key={trainer._id} value={trainer._id}>
              {trainer.fullName}
              {trainer.specialization?.length
                ? ` — ${trainer.specialization.join(", ")}`
                : ""}
            </option>
          ))}
        </select>
        {trainersError && (
          <EmptyState message={trainersError} />
        )}
        {!trainersLoading && !trainersError && trainers.length === 0 && (
          <EmptyState message="No trainers are available for booking." />
        )}
      </div>

      {/* Notifications */}
      {status.error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-700 animate-fadeIn">
          <XCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{status.error}</span>
        </div>
      )}

      {status.success && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm font-medium text-green-700">
          {status.success}
        </div>
      )}

      {/* Today's date */}
      <div className="mb-4 flex items-center gap-1.5 text-xs font-medium text-gray-400 cursor-pointer">
        <CalendarDays className="w-3.5 h-3.5" />
        Today: {todayLabel}
      </div>

      {/* Date */}
      <div className="mb-5">
        <label
          htmlFor="bookingDate"
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"
        >
          <CalendarDays className="w-4 h-4 text-gray-400 cursor-pointer" />
          Booking Date
        </label>
        <input
          id="bookingDate"
          type="date"
          name="bookingDate"
          value={formData.bookingDate}
          onChange={handleChange}
          min={todayStr}
          required
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-800 transition focus:border-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 cursor-pointer"
        />
      </div>

      {/* Time Slot from the selected database booking option */}
      <div className="mb-5">
        <label
          htmlFor="timeSlot"
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"
        >
          <Clock className="w-4 h-4 text-gray-400" />
          Time Slot
        </label>
        <select
          id="timeSlot"
          name="timeSlot"
          value={formData.timeSlot}
          onChange={handleChange}
          required
          disabled={
            !formData.bookingDate ||
            !formData.bookingOptionId ||
            availableSlots.length === 0
          }
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-800 transition focus:border-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <option value="">
            {!formData.bookingDate
              ? "Select a date first"
              : !formData.bookingOptionId
                ? "Select a session type first"
                : availableSlots.length === 0
                  ? "No slots available today"
                  : "Select time slot"}
          </option>
          {availableSlots.map((slot) => (
            <option key={`${slot.label}-${slot.startHour}`} value={getSlotLabel(slot)}>
              {getSlotLabel(slot)}
            </option>
          ))}
        </select>
        {selectedTrainer && formData.bookingDate && availableSlots.length === 0 && (
          <p className="mt-2 text-sm text-amber-700">
            This trainer is not available for the selected date or time.
          </p>
        )}
      </div>

      {/* Session Type from the database */}
      <div className="mb-5">
        <label
          htmlFor="bookingOptionId"
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2"
        >
          <Dumbbell className="w-4 h-4 text-gray-400" />
          Session Type
        </label>
        <select
          id="bookingOptionId"
          name="bookingOptionId"
          value={formData.bookingOptionId}
          onChange={handleChange}
          required
          disabled={optionsLoading || bookingOptions.length === 0}
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-800 transition focus:border-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 cursor-pointer"
        >
          <option value="">
            {optionsLoading
              ? "Loading session types..."
              : bookingOptions.length === 0
                ? "No sessions configured for this trainer"
                : "Select session type"}
          </option>
          {bookingOptions.map((option) => (
            <option key={option._id} value={option._id}>
              {option.name}
            </option>
          ))}
        </select>
        {optionsError && (
          <EmptyState message={optionsError} />
        )}
      </div>

      {/* Notes */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label
            htmlFor="notes"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700"
          >
            <NotebookPen className="w-4 h-4 text-gray-400" />
            Additional Notes
          </label>
          <span className="text-xs text-gray-400">Optional</span>
        </div>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          maxLength={300}
          rows="3"
          placeholder="Anything specific you'd like your trainer to prepare for?"
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-800 transition focus:border-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
        />
        <div className="text-right text-xs text-gray-400 mt-1">
          {formData.notes.length}/300
        </div>
      </div>

      {/* Amount */}
      {selectedOption && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <Wallet className="w-4 h-4 text-gray-400" />
            Amount to pay
          </span>
          <span className="text-sm font-bold text-gray-900">
            Rs. {sessionPrice.toLocaleString()}
          </span>
        </div>
      )}

      {/* Payment method */}
      <fieldset className="mb-6">
        <legend className="text-sm font-semibold text-gray-700 mb-3">
          Payment Method
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {["eSewa", "Cash"].map((method) => (
            <label
              key={method}
              className={`rounded-xl border px-4 py-3 text-center text-sm font-semibold cursor-pointer transition ${
                formData.paymentMethod === method
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={formData.paymentMethod === method}
                onChange={handleChange}
                className="sr-only"
              />
              {method === "eSewa" ? "Pay online with eSewa" : "Pay cash at gym"}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Submit — creates the booking, then redirects to eSewa to pay */}
      <button
        type="submit"
        disabled={status.loading || !isFormValid}
        className="w-full flex items-center justify-center gap-2 bg-black border-2 border-black text-white py-3.5 rounded-xl font-semibold hover:bg-transparent hover:text-black transition duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
      >
        {status.loading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5" />
            <span>Processing...</span>
          </>
        ) : (
          "Proceed to Payment"
        )}
      </button>

      {/* Popup when a guest tries to book. */}
      {loginPrompt}
    </form>

  );
};

export default BookingForm;

import React, { useEffect, useState } from "react";
import { CheckCircle2, MessageSquareQuote, Star, Trash2 } from "lucide-react";
import { deleteReview, getMyReview, getReviews, saveReview } from "../../../api/review.api";
import { LoginPromptModal } from "../../Common/LoginPrompt";

const Stars = ({ value = 0, size = 16 }) => (
  <span className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} size={size} className={star <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
    ))}
  </span>
);

// Public review wall + a write/update form. Guests can browse and type,
// but posting asks them to log in first.
const ReviewsSection = () => {
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const loadReviews = () =>
    getReviews()
      .then((response) => setReviews(response.data?.reviews || []))
      .catch(() => {});

  useEffect(() => {
    loadReviews();
    if (isLoggedIn) {
      // Track whether the member already has a review (for the delete button),
      // but never preload its content into the form.
      getMyReview()
        .then((response) => setMyReview(response.data?.review || null))
        .catch(() => {});
    }
  }, [isLoggedIn]);

  const submit = async (event) => {
    event.preventDefault();
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    setStatus({ loading: true, error: "", success: "" });
    try {
      await saveReview(form);
      setStatus({ loading: false, error: "", success: myReview ? "Review updated!" : "Thanks for your review!" });
      setForm({ rating: 5, comment: "" });
      await loadReviews();
      const response = await getMyReview();
      setMyReview(response.data?.review || null);
      setShowSuccessModal(true);
    } catch (requestError) {
      setStatus({
        loading: false,
        error: requestError.response?.data?.message || "Could not save your review.",
        success: "",
      });
    }
  };

  const removeMine = async () => {
    if (!myReview || !window.confirm("Delete your review?")) return;
    try {
      await deleteReview(myReview._id);
      setMyReview(null);
      setForm({ rating: 5, comment: "" });
      setStatus({ loading: false, error: "", success: "" });
      loadReviews();
    } catch {
      setStatus((prev) => ({ ...prev, error: "Could not delete your review." }));
    }
  };

  return (
    <section className="bg-slate-50 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.25em] text-red-500">
            <MessageSquareQuote size={17} /> Member voices
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">What our members say</h2>
        </header>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((review) => (
            <article key={review._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-red-500/15">
              <Stars value={review.rating} />
              <p className="mt-4 leading-7 text-slate-600">“{review.comment}”</p>
              <footer className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#27253F] text-sm font-bold text-white">
                  {(review.userId?.name || review.name || "A").charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{review.userId?.name || review.name}</p>
                  {review.trainerId?.fullName && <p className="text-xs text-slate-500">Trained by {review.trainerId.fullName}</p>}
                </div>
              </footer>
            </article>
          ))}
          {!reviews.length && <p className="col-span-full py-8 text-center text-slate-500">No reviews yet — be the first to share your experience.</p>}
        </div>

        {/* Write or update your own review */}
        <form onSubmit={submit} className="mx-auto mt-12 max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-red-500/15">
          <h3 className="text-xl font-bold text-slate-900">Share your experience</h3>
          {isLoggedIn && myReview && (
            <p className="mt-1 text-xs text-slate-400">
              You already reviewed ApexFit — posting again will update it.
            </p>
          )}
          <div className="mt-4 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setForm({ ...form, rating: star })}
                aria-label={`Rate ${star} of 5 stars`}
                className="transition hover:scale-110"
              >
                <Star size={30} className={(hoverRating || form.rating) >= star ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
              </button>
            ))}
            <span className="ml-2 text-sm font-semibold text-slate-500">{form.rating}/5</span>
          </div>
          <textarea
            required
            rows="4"
            maxLength={600}
            value={form.comment}
            onChange={(event) => setForm({ ...form, comment: event.target.value })}
            placeholder={isLoggedIn && myReview ? "Update your thoughts…" : "Tell others about training at ApexFit…"}
            className="mt-4 w-full resize-none rounded-xl border p-4 outline-none focus:border-[#27253F]"
          />
          {status.error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{status.error}</p>}
          {status.success && <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-700">{status.success}</p>}
          <div className="mt-5 flex gap-3">
            <button disabled={status.loading} className="flex-1 rounded-xl border-2 border-black bg-black px-6 py-3 font-semibold text-white transition hover:bg-transparent hover:text-black disabled:opacity-60">
              {isLoggedIn ? (status.loading ? "Saving…" : myReview ? "Update review" : "Post review") : "Log in to post"}
            </button>
            {isLoggedIn && myReview && (
              <button type="button" onClick={removeMine} aria-label="Delete my review" className="rounded-xl border border-red-200 p-3 text-red-600 transition hover:bg-red-50">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </form>

        {/* Success popup after posting or updating a review */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 size={44} className="text-green-600" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-slate-900">
                {myReview ? "Review updated!" : "Review posted!"}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Thanks for sharing — your review is now live on the member wall.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 w-full rounded-xl border-2 border-black bg-black py-3 font-semibold text-white transition hover:bg-transparent hover:text-black"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Login prompt shown when a guest tries to post */}
        <LoginPromptModal
          open={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          message="Please log in to post your review. Your rating and message will be kept safe."
        />
      </div>
    </section>
  );
};

export default ReviewsSection;

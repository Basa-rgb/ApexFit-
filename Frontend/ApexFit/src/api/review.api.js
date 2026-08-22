import api from "./axios";

export const getReviews = () => api.get("/reviews");

export const getMyReview = () => api.get("/reviews/mine");

export const saveReview = (data) => api.post("/reviews", data);

export const deleteReview = (id) => api.delete(`/reviews/${id}`);

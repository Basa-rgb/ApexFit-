import api from "./axios";

export const getBookingOptions = (trainerId) =>
  api.get("/bookings/options", { params: trainerId ? { trainerId } : {} });

export const getMySessionTypes = () =>
  api.get("/bookings/options/mine");

export const createMySessionType = (data) =>
  api.post("/bookings/options/mine", data);

export const updateMySessionType = (id, data) =>
  api.put(`/bookings/options/mine/${id}`, data);

export const deleteMySessionType = (id) =>
  api.delete(`/bookings/options/mine/${id}`);

export const createBooking = (data) =>
  api.post("/bookings", data);

export const getAllBookings = () =>
  api.get("/bookings");

export const getMyBookings = () =>
  api.get("/bookings/mine");

export const getBookingById = (id) =>
  api.get(`/bookings/${id}`);

export const updateBooking = (id, data) =>
  api.put(`/bookings/${id}`, data);

export const deleteBooking = (id) =>
  api.delete(`/bookings/${id}`);
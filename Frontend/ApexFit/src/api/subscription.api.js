import api from "./axios";

export const createSubscription = (data) =>
  api.post("/subscriptions", data);

export const getAllSubscriptions = () =>
  api.get("/subscriptions");

export const getSubscriptionById = (id) =>
  api.get(`/subscriptions/${id}`);

export const updateSubscription = (id, data) =>
  api.put(`/subscriptions/${id}`, data);

export const deleteSubscription = (id) =>
  api.delete(`/subscriptions/${id}`);
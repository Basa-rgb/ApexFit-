import api from "./axios";

export const subscribeNewsletter = (data) =>
  api.post("/newsletter/subscribe", data);

export const getAllSubscribers = () =>
  api.get("/newsletter");

export const deleteSubscriber = (id) =>
  api.delete(`/newsletter/${id}`);

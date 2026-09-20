import api from "./axios";

export const initiateEsewaPayment = (data) =>
  api.post("/esewa/initiate-payment", data);

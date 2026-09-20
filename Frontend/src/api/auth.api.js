import api from "./axios";

export const register = (data) =>
  api.post("/auth/register/send-otp", data);

export const verifyOtp = (data) =>
  api.post("/auth/register/verify-otp", data);

export const resendRegistrationOtp = (data) =>
  api.post("/auth/register/resend-otp", data);

export const login = (data) =>
  api.post("/auth/login", data);

export const googleAuth = (data) =>
  api.post("/auth/google", data);

export const forgotPassword = (data) =>
  api.post("/auth/forgot-password", data);

export const resetPassword = (token, data) =>
  api.post(`/auth/reset-password/${token}`, data);

export const changePassword = (data) =>
  api.put("/auth/change-password", data);

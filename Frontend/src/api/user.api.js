import api from "./axios";

export const getProfile = () =>
  api.get("/users/profile");

export const getUserDashboard = () =>
  api.get("/users/dashboard");

export const getTrainerDashboard = () =>
  api.get("/users/trainer-dashboard");

export const updateProfile = (data) =>
  api.put("/users/profile", data);

export const deleteAccount = () =>
  api.delete("/users/profile");
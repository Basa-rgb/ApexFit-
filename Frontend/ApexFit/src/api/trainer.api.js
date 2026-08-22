import api from "./axios";

export const createTrainer = (formData) =>
  api.post("/trainers", formData, { headers: { "Content-Type": "multipart/form-data" } });

export const getAllTrainers = () =>
  api.get("/trainers");

export const getTrainerById = (id) =>
  api.get(`/trainers/${id}`);

export const updateTrainer = (id, formData) =>
  api.put(`/trainers/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });

export const updateMyTrainerProfile = (formData) =>
  api.put("/trainers/me", formData, { headers: { "Content-Type": "multipart/form-data" } });

export const deleteTrainer = (id) =>
  api.delete(`/trainers/${id}`);
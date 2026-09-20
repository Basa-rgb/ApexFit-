import api from "./axios";

export const createWorkout = (data) =>
  api.post("/workout-plans", data);

export const getAllWorkouts = () =>
  api.get("/workout-plans");

export const getWorkoutById = (id) =>
  api.get(`/workout-plans/${id}`);

export const updateWorkout = (id, data) =>
  api.put(`/workout-plans/${id}`, data);

export const deleteWorkout = (id) =>
  api.delete(`/workout-plans/${id}`);
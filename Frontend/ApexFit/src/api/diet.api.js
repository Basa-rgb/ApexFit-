import api from "./axios";

export const createDietPlan = (data) =>
  api.post("/diet-plans", data);

export const getAllDietPlans = () =>
  api.get("/diet-plans");

export const getDietPlanById = (id) =>
  api.get(`/diet-plans/${id}`);

export const updateDietPlan = (id, data) =>
  api.put(`/diet-plans/${id}`, data);

export const deleteDietPlan = (id) =>
  api.delete(`/diet-plans/${id}`);
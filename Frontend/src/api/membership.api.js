import api from "./axios";

export const createMembershipPlan = (data) =>
  api.post("/membership-plans", data);

export const getAllMembershipPlans = () =>
  api.get("/membership-plans");

export const getMembershipPlanById = (id) =>
  api.get(`/membership-plans/${id}`);

export const updateMembershipPlan = (id, data) =>
  api.put(`/membership-plans/${id}`, data);

export const deleteMembershipPlan = (id) =>
  api.delete(`/membership-plans/${id}`);
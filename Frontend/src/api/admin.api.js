import api from "./axios";

export const getAdminDashboard = () => api.get("/admin/dashboard");
export const getAdminUsers = (search = "") => api.get("/admin/users", { params: { search } });
export const createAdminUser = (data) => api.post("/admin/users", data);
export const updateAdminUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`);
import api from "./axios";

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const createBlog = (formData) =>
  api.post("/blog", formData, multipart);

export const getAllBlogs = () =>
  api.get("/blog");

export const getBlogById = (id) =>
  api.get(`/blog/${id}`);

export const updateBlog = (id, formData) =>
  api.put(`/blog/${id}`, formData, multipart);

export const deleteBlog = (id) =>
  api.delete(`/blog/${id}`);
import api from "./axios";

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const createGallery = (formData) =>
  api.post("/gallery", formData, multipart);

export const getAllGallery = () =>
  api.get("/gallery");

export const getGalleryById = (id) =>
  api.get(`/gallery/${id}`);

export const updateGallery = (id, formData) =>
  api.put(`/gallery/${id}`, formData, multipart);

export const deleteGallery = (id) =>
  api.delete(`/gallery/${id}`);
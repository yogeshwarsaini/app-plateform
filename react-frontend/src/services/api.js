import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export const getItems = () => api.get("/api/v1/items");
export const getItem = (id) => api.get(`/api/v1/items/${id}`);
export const createItem = (data) => api.post("/api/v1/items", data);
export const deleteItem = (id) => api.delete(`/api/v1/items/${id}`);

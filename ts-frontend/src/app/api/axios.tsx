import axios from "axios";

// front

export const axiosFront = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/`,
});

axiosFront.interceptors.request.use((config) => {
  return config;
});

// Individual
export const axiosIndividual = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/`,
});
axiosIndividual.interceptors.request.use((config) => {
  const token = localStorage.getItem("individualToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Company
export const axiosCompany = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/`,
});
axiosCompany.interceptors.request.use((config) => {
  const token = localStorage.getItem("companyToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Technician
export const axiosTechnician = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/`,
});
axiosTechnician.interceptors.request.use((config) => {
  const token = localStorage.getItem("technicianToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Admin
export const axiosAdmin = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/`,
});
axiosAdmin.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

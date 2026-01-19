import { axiosCompany, axiosIndividual } from "./axios";

export async function fetchUserAddresses(userType: string | null) {
  const api = userType === "company" ? axiosCompany : axiosIndividual;
  const { data } = await api.get(`${userType}/addresses`);
  return data;
}
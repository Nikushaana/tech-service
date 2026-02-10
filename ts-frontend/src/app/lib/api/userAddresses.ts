import { axiosCompany, axiosIndividual } from "./axios";

export async function fetchUserAddresses(page: number, userType: ClientRole | null) {
  const api = userType === "company" ? axiosCompany : axiosIndividual;
  const { data } = await api.get(`${userType}/addresses?page=${page}`);
  return data;
}
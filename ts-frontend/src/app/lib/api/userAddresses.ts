import { axiosCompany, axiosIndividual } from "./axios";

export async function fetchUserAddresses(userType: ClientRole | null, page?: number) {
  const api = userType === "company" ? axiosCompany : axiosIndividual;
  const { data } = await api.get(`${userType}/addresses?page=${page || 1}`);
  return data;
}
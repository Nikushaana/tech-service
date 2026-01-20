import { axiosCompany, axiosIndividual } from "./axios";

export async function fetchUserCalculatePrice(
  userType: ClientRole | null, payload: {
    addressId: number;
    service_type: OrderType
  }) {
  const api = userType === "company" ? axiosCompany : axiosIndividual;
  const { data } = await api.post(`${userType}/calculate-price`, payload);
  return data;
}
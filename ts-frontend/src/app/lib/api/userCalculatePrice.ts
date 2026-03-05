import { api } from "./axios";

export async function fetchUserCalculatePrice(
  userType: ClientRole | null, payload: {
    addressId: number;
    service_type: OrderType
  }) {
  const { data } = await api.post(`${userType}/calculate-price`, payload);
  return data;
}
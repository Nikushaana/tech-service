import { api } from "./axios";

export async function fetchUserAddresses(userType: ClientRole | null, page?: number) {
  const { data } = await api.get(`${userType}/addresses?page=${page || 1}`);
  return data;
}
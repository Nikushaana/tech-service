import { api } from "./axios";

export async function fetchStreets(street: string) {
  const { data } = await api.get(`front/streets?street=${street}`);
  return data;
}
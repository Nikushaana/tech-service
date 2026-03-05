import { api } from "./axios";

export async function fetchCities(city: string) {
  const { data } = await api.get(`front/cities?city=${city}`);
  return data;
}
export async function fetchStreets(city: string, street: string) {
  const { data } = await api.get(`front/streets?city=${city}&street=${street}`);
  return data;
}
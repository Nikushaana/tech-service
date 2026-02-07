import { axiosFront } from "./axios";

export async function fetchCities(city: string) {
  const { data } = await axiosFront.get(`front/cities?city=${city}`);
  return data;
}
export async function fetchStreets(city: string, street: string) {
  const { data } = await axiosFront.get(`front/streets?city=${city}&street=${street}`);
  return data;
}
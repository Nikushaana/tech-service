import { api } from "./axios";

export async function fetchFrontCategories() {
  const { data } = await api.get("front/categories");
  return data;
}
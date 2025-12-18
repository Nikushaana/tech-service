import { axiosFront } from "./axios";

export async function fetchFrontCategories() {
  const { data } = await axiosFront.get("front/categories");
  return data;
}
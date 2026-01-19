import { axiosFront } from "./axios";

export async function fetchFrontBranches() {
  const { data } = await axiosFront.get("front/branches");
  return data;
}
import { axiosFront } from "./axios";

export async function fetchBranches() {
  const { data } = await axiosFront.get("front/branches");
  return data;
}
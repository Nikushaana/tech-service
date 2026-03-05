import { api } from "./axios";

export async function fetchFrontBranches() {
  const { data } = await api.get("front/branches");
  return data;
}
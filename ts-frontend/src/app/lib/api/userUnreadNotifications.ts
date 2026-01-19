import { axiosCompany, axiosIndividual } from "./axios";

export async function fetchUserUnreadNotifications(userType: ClientRole | undefined) {
  if (!userType) return 0;
  const api = userType === "company" ? axiosCompany : axiosIndividual;
  const { data } = await api.get(`${userType}/notifications/unread`);
  return data;
}
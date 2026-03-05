import { api } from "./axios";

export async function fetchUserUnreadNotifications(userType: ClientRole) {
  const { data } = await api.get(`${userType}/notifications/unread`);
  return data;
}
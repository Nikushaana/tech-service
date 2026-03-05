import { api } from "./axios";

export async function fetchAdminUnreadNotifications() {
  const { data } = await api.get(`admin/notifications/unread`);
  return data;
};
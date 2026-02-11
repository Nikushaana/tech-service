import { axiosAdmin } from "./axios";

export async function fetchAdminUnreadNotifications() {
  const { data } = await axiosAdmin.get(`admin/notifications/unread`);
  return data;
};
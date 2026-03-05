import { api } from "./axios";

export async function fetchStaffUnreadNotifications(staffType: StaffRole) {
  const { data } = await api.get(`${staffType}/notifications/unread`);
  return data;
}
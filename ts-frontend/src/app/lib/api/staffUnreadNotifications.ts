import { axiosDelivery, axiosTechnician } from "./axios";

export async function fetchStaffUnreadNotifications(staffType: StaffRole) {
  const api = staffType === "technician" ? axiosTechnician : axiosDelivery;
  const { data } = await api.get(`${staffType}/notifications/unread`);
  return data;
}
"use client";

import React from "react";
import StaffDetailsForm from "@/app/components/staff/staff-details-form";
import StaffPhoneUpdate from "@/app/components/staff/staff-phone-update";
import StaffPasswordUpdate from "@/app/components/staff/staff-password-update";

export default function Page() {
  return (
    <div className="flex flex-col gap-y-[20px] w-full">
      <StaffDetailsForm />
      <hr />
      <StaffPhoneUpdate />
      <hr />
      <StaffPasswordUpdate />
    </div>
  );
}

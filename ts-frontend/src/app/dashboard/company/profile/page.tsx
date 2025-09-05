"use client";

import CompanyDetailsForm from "@/app/components/dashboard/company/company-details-form";
import CompanyPasswordUpdate from "@/app/components/dashboard/company/company-password-update";
import CompanyPhoneUpdate from "@/app/components/dashboard/company/company-phone-update";
import React from "react";

export default function page() {
  return (
    <div className="flex flex-col gap-y-[20px] w-full">
      {/* company details update */}
      <CompanyDetailsForm />
      <hr />
      {/* phone update */}
      <CompanyPhoneUpdate />
      <hr />
      {/* change password */}
      <CompanyPasswordUpdate />
    </div>
  );
}

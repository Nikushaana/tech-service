"use client";

import CompanyDetailsForm from "@/app/components/dashboard/company/company-details-form";
import CompanyPasswordUpdate from "@/app/components/dashboard/company/company-password-update";
import CompanyPhoneUpdate from "@/app/components/dashboard/company/company-phone-update";
import IndividualDetailsForm from "@/app/components/dashboard/individual/individual-details-form";
import IndividualPasswordUpdate from "@/app/components/dashboard/individual/individual-password-update";
import IndividualPhoneUpdate from "@/app/components/dashboard/individual/individual-phone-update";
import { useParams } from "next/navigation";
import React from "react";

export default function Page() {
  const { userType } = useParams<{
    userType: "company" | "individual";
  }>();

  return (
    <div className="flex flex-col gap-y-[20px] w-full">
      {userType === "company" ? (
        <>
          <CompanyDetailsForm />
          <hr />
          <CompanyPhoneUpdate />
          <hr />
          <CompanyPasswordUpdate />
        </>
      ) : (
        <>
          <IndividualDetailsForm />
          <hr />
          <IndividualPhoneUpdate />
          <hr />
          <IndividualPasswordUpdate />
        </>
      )}
    </div>
  );
}

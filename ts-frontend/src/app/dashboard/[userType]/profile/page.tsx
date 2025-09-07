"use client";

import CompanyDetailsForm from "@/app/components/dashboard/company/company-details-form";
import CompanyPasswordUpdate from "@/app/components/dashboard/company/company-password-update";
import CompanyPhoneUpdate from "@/app/components/dashboard/company/company-phone-update";
import IndividualDetailsForm from "@/app/components/dashboard/individual/individual-details-form";
import IndividualPasswordUpdate from "@/app/components/dashboard/individual/individual-password-update";
import IndividualPhoneUpdate from "@/app/components/dashboard/individual/individual-phone-update";
import React from "react";

interface PageProps {
  params: Promise<{
    userType: "company" | "individual";
  }>;
}

export default function Page({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { userType } = resolvedParams;

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

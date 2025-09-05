"use client";

import IndividualDetailsForm from "@/app/components/dashboard/individual/individual-details-form";
import IndividualPasswordUpdate from "@/app/components/dashboard/individual/individual-password-update";
import IndividualPhoneUpdate from "@/app/components/dashboard/individual/individual-phone-update";
import React from "react";

export default function page() {
  return (
    <div className="flex flex-col gap-y-[20px] w-full">
      {/* individual details update */}
      <IndividualDetailsForm />
      <hr />
      {/* phone update */}
      <IndividualPhoneUpdate />
      <hr />
      {/* change password */}
      <IndividualPasswordUpdate />
    </div>
  );
}

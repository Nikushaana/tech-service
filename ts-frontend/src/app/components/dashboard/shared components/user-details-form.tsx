"use client";

import React from "react";
import PanelFormInput from "../../inputs/panel-form-input";

interface CompanyValues {
  companyName: string;
  companyAgentName: string;
  companyAgentLastName: string;
  companyIdentificationCode: string;
  images: string[];
  deletedImages: string[];
  newImages: File[];
}

interface IndividualValues {
  name: string;
  lastName: string;
  images: string[];
  deletedImages: string[];
  newImages: File[];
}

interface UserDetailsFormProps {
  values: CompanyValues | IndividualValues;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  fields: { id: string; label: string }[];
  title?: string;
}

export default function UserDetailsForm({
  values,
  errors,
  onChange,
  fields,
  title,
}: UserDetailsFormProps) {
  return (
    <div className="flex flex-col gap-y-[10px]">
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-center gap-[20px]">
        {fields.map((field) => (
          <PanelFormInput
            key={field.id}
            id={field.id}
            value={(values as any)[field.id] || ""}
            onChange={(e) => onChange(field.id, e.target.value)}
            label={field.label}
            error={errors[field.id]}
          />
        ))}
      </div>
    </div>
  );
}

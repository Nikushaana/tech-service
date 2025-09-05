"use client";

import React from "react";
import PanelFormInput from "../../inputs/panel-form-input";
import { Button } from "../../ui/button";

interface UserPhoneFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  sentCode: string;
  title?: string;
}

export default function UserPhoneUpdate({
  values,
  errors,
  onChange,
  sentCode,
  title,
}: UserPhoneFormProps) {
  return (
    <div className="flex flex-col gap-y-[10px] w-full">
      {title && <h2>{title}</h2>}
      <p className="text-center text-sm">
        {sentCode
          ? "შეიყვანე ტელეფონის ნომერზე გამოგზავნილი კოდი"
          : "თუ გსურს ტელეფონის ნომრის განახლება საჭიროა ახალი ნომრის დადასტურება ვალიდური კოდით"}
      </p>

      {/* For debug, can remove */}
      {sentCode && <p>{sentCode}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
        {sentCode ? (
          <PanelFormInput
            id="code"
            value={values.code}
            onChange={(e) => onChange("code", e.target.value)}
            label="კოდი"
            error={errors.code}
          />
        ) : (
          <PanelFormInput
            id="phone"
            value={values.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            label="ტელეფონის ნომერი"
            error={errors.phone}
          />
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import PanelFormInput from "../../inputs/panel-form-input";

interface UserPasswordFormProps {
  values: {
    oldPassword: string;
    newPassword: string;
    repeatNewPassword: string;
  };
  errors: {
    oldPassword?: string;
    newPassword?: string;
    repeatNewPassword?: string;
  };
  onChange: (field: string, value: string) => void;
  title?: string;
}

export default function UserPasswordUpdate({
  values,
  errors,
  onChange,
  title,
}: UserPasswordFormProps) {
  return (
    <div className="flex flex-col gap-y-[10px] w-full">
      {title && <h2>{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
        <PanelFormInput
          id="oldPassword"
          value={values.oldPassword}
          onChange={(e) => onChange("oldPassword", e.target.value)}
          label="ძველი პაროლი"
          error={errors.oldPassword}
          type="password"
        />
        <PanelFormInput
          id="newPassword"
          value={values.newPassword}
          onChange={(e) => onChange("newPassword", e.target.value)}
          label="ახალი პაროლი"
          error={errors.newPassword}
          type="password"
        />
        <PanelFormInput
          id="repeatNewPassword"
          value={values.repeatNewPassword}
          onChange={(e) => onChange("repeatNewPassword", e.target.value)}
          label="გაიმეორე ახალი პაროლი"
          error={errors.repeatNewPassword}
          type="password"
        />
      </div>
    </div>
  );
}

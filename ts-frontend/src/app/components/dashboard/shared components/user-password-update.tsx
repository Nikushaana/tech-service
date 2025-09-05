"use client";

import React from "react";
import PanelFormInput from "../../inputs/panel-form-input";
import { Button } from "../../ui/button";

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
  onSubmit: () => void;
  title?: string;
}

export default function UserPasswordUpdate({
  values,
  errors,
  onChange,
  onSubmit,
  title,
}: UserPasswordFormProps) {
  return (
    <div className="flex flex-col gap-y-[20px] w-full">
      {title && <h2>{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
        <PanelFormInput
          id="oldPassword"
          value={values.oldPassword}
          onChange={(e) => onChange("oldPassword", e.target.value)}
          label="ძველი პაროლი"
          error={errors.oldPassword}
        />
        <PanelFormInput
          id="newPassword"
          value={values.newPassword}
          onChange={(e) => onChange("newPassword", e.target.value)}
          label="ახალი პაროლი"
          error={errors.newPassword}
        />
        <PanelFormInput
          id="repeatNewPassword"
          value={values.repeatNewPassword}
          onChange={(e) => onChange("repeatNewPassword", e.target.value)}
          label="გაიმეორე ახალი პაროლი"
          error={errors.repeatNewPassword}
        />
      </div>
      <Button onClick={onSubmit} className="h-11 cursor-pointer self-end">
        განახლება
      </Button>
    </div>
  );
}
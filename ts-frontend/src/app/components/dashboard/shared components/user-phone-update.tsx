"use client";

import React from "react";
import PanelFormInput from "../../inputs/panel-form-input";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPhone } from "@/app/utils/phone";

interface UserPhoneFormProps {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  sentCode: string;
  title?: string;
  onSubmit1: () => void; // verifying code
  onSubmit2: () => void; // sending code
  loading: boolean;
}

export default function UserPhoneUpdate({
  values,
  errors,
  onChange,
  sentCode,
  title,
  onSubmit1,
  onSubmit2,
  loading,
}: UserPhoneFormProps) {
  return (
    <div className="flex flex-col gap-y-[20px] w-full">
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
              onChange={(e) => onChange("phone", formatPhone(e.target.value))}
              label="ტელეფონის ნომერი"
              error={errors.phone}
            />
          )}
        </div>
      </div>
      <Button
        onClick={sentCode ? onSubmit1 : onSubmit2}
        disabled={loading}
        className="h-11 cursor-pointer self-end"
      >
        {loading && <Loader2Icon className="animate-spin" />}
        {sentCode ? "შემოწმება" : "კოდის გაგზავნა"}
      </Button>
    </div>
  );
}

"use client";

import React from "react";
import { Input } from "@/app/components/ui/input";

interface FormInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  type?: string;
  error?: string;
}

export default function PanelFormInput({
  id,
  value,
  onChange,
  label,
  type = "text",
  error,
}: FormInputProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="text-myGray text-sm">
        {label}
      </label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={label}
        className={`rounded-[8px] border-2 mt-[5px] focus-visible:ring-0 shadow-none px-2 h-9 ${
          error ? "border-red-500" : "border-gray-300"
        } `}
      />
    </div>
  );
}

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

export default function FormInput({
  id,
  value,
  onChange,
  label,
  type = "text",
  error,
}: FormInputProps) {
  return (
    <div className="relative w-full">
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=""
        className={`peer rounded-none border-0 border-b-2 focus-visible:ring-0 shadow-none px-0 h-11 ${
          error ? "border-red-500" : "border-gray-300"
        } `}
      />
      <label
        htmlFor={id}
        className="absolute left-0 top-0 text-gray-400 text-sm duration-200
                   transform -translate-y-3 scale-90 origin-left
                   peer-placeholder-shown:translate-y-2 peer-placeholder-shown:scale-100
                   peer-focus:-translate-y-3 peer-focus:scale-90"
      >
        {label}
      </label>
    </div>
  );
}

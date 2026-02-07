"use client";

import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

interface FormInputProps {
  id: string;
  value: string | number;
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
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  return (
    <div className="w-full">
      <label htmlFor={id} className="text-myGray text-sm">
        {label}
      </label>
      <div className="w-full relative">
        <Input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={label}
          className={`rounded-[8px] border-2 mt-[5px] focus-visible:ring-0 shadow-none px-2 h-9 ${
            error ? "border-red-500" : "border-gray-300"
          } `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}

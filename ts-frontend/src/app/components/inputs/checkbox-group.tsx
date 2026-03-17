"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface CheckboxGroupProps<T> {
  data: T[];
  id: string;
  value: string;
  label: string;
  error?: string;
  valueKey: keyof T;
  labelKey: keyof T | ((item: T) => string);
  onChange: (e: { target: { id: string; value: string } }) => void;
}

export function CheckboxGroup<T>({
  data,
  id,
  value,
  label,
  error,
  valueKey,
  labelKey,
  onChange,
}: CheckboxGroupProps<T>) {
  const getLabel = (item: T) =>
    typeof labelKey === "function" ? labelKey(item) : String(item[labelKey]);

  const handleToggle = (val: string) => {
    onChange({
      target: {
        id,
        value: val,
      },
    });
  };

  return (
    <div className="w-full">
      <label className="text-myGray text-sm">{label}</label>

      <div className="mt-2 flex flex-col gap-2">
        {data?.map((item) => {
          const val = String(item[valueKey]);
          const checked = value.includes(val);

          return (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={checked}
                onCheckedChange={() => handleToggle(val)}
                className={`${
                  error ? "border border-red-500" : ""
                }`}
              />

              <span className="text-[15px]">{getLabel(item)}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

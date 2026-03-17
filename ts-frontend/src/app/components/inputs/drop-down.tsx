"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function Dropdown<T>({
  data,
  id,
  value,
  label,
  placeholder = "",
  error,
  valueKey,
  labelKey,
  onChange,
}: {
  data: T[];
  id: string;
  value: string;
  label: string;
  placeholder?: string;
  error?: string;
  valueKey: keyof T;
  labelKey: keyof T | ((item: T) => string);
  onChange: (e: { target: { id: string; value: string } }) => void;
}) {
  const selectedItem = data?.find(
    (item) => String(item[valueKey]) === String(value)
  );

  const getLabel = (item: T) =>
    typeof labelKey === "function"
      ? labelKey(item)
      : String(item[labelKey]);

  const displayText = selectedItem ? getLabel(selectedItem) : placeholder;

  const handleSelect = (val: string) => {
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Input
            readOnly
            value={displayText}
            className={`mt-[3px] cursor-pointer border-1 rounded-full h-9 px-3 text-start ${
              !value ? "text-gray-400" : ""
            } ${error ? "border-red-500" : "border-gray-300"}`}
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[140px] overflow-y-auto rounded-[18px] border-1">
          <DropdownMenuRadioGroup
            value={String(value)}
            onValueChange={handleSelect}
          >
            {data?.map((item) => (
              <DropdownMenuRadioItem
                key={String(item[valueKey])}
                value={String(item[valueKey])}
                className="cursor-pointer text-sm rounded-[20px]"
              >
                {getLabel(item)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

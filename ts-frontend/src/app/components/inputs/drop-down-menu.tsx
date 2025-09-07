"use client";

import * as React from "react";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";

interface DropdownProps {
  data: any[];
  id: string;
  value: string | number;
  label: string;
  error?: string;
  onChange: (e: { target: { id: string; value: string } }) => void;
}

export function Dropdown({
  data,
  id,
  value,
  label,
  error,
  onChange,
}: DropdownProps) {
  const [selected, setSelected] = React.useState<string | number>(value || "");

  React.useEffect(() => {
    setSelected(value || "");
  }, [value]);

  const handleSelect = (val: string) => {
    setSelected(val);
    
    const syntheticEvent = {
      target: { id, value: val },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  return (
    <div className="w-full">
      <label className="text-myGray text-sm">{label}</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Input
            value={
              data?.find((item: any) => String(item.id) === String(selected))
                ?.name || label
            }
            className={`${!selected && "text-gray-400 "} rounded-[8px] text-start border-2 mt-[5px] focus-visible:ring-0 shadow-none cursor-pointer px-2 h-9 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[140px] overflow-y-auto showScroll rounded-[8px] border-2 border-gray-300 shadow-lg">
          <DropdownMenuRadioGroup
            value={String(selected)}
            onValueChange={handleSelect}
          >
            {data?.map((item: any) => (
              <DropdownMenuRadioItem
                key={item.id}
                value={String(item.id)}
                className="py-1 rounded-[6px] hover:bg-gray-100 cursor-pointer text-sm"
              >
                {item.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

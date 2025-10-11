"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Loader2Icon } from "lucide-react";

interface DropdownProps {
  id: string;
  data: any[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (item: any) => void;
  label: string;
  error?: string;
  isLoading?: boolean;
}

export function Dropdown2({
  id,
  data,
  value,
  onChange,
  onSelect,
  label,
  error,
  isLoading,
}: DropdownProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (data?.length > 0) {
      setOpen(true);
    } else setOpen(false);
  }, [data]);

  return (
    <div className="w-full relative">
      <label className="text-myGray text-sm">{label}</label>
      {isLoading && (
        <Loader2Icon className="absolute right-[10px] bottom-[10px] pointer-events-none animate-spin w-[15px] h-[15px]" />
      )}
      <Input
        id={id}
        type="text"
        value={value}
        placeholder={isLoading ? "იტვირთება..." : label}
        onChange={onChange}
        className={`rounded-[8px] text-start border-2 mt-[5px] focus-visible:ring-0 shadow-none px-2 h-9 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />

      {open && (
        <div className="absolute z-50 w-full mt-1 max-h-[140px] overflow-y-scroll rounded-[8px] border-2 border-gray-300 shadow-lg bg-white">
          {data.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelect(item);
                setOpen(false);
              }}
              className="py-1 px-2 cursor-pointer hover:bg-gray-100 text-sm rounded-[6px]"
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

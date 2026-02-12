// "use client";

// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { endOfDay, format, startOfDay } from "date-fns";
// import { type DateRange } from "react-day-picker";
// import { Input } from "@/components/ui/input";

// export default function DateRangePicker({
//   id,
//   value,
//   label,
//   error,
//   setValue,
// }: {
//   id: string;
//   value: DateRange | undefined;
//   label: string;
//   error?: string;
//   setValue: any;
// }) {
//   const displayText = value?.from
//     ? value.to
//       ? `${format(value.from, "LLL dd, y")} - ${format(value.to, "LLL dd, y")}`
//       : format(value.from, "LLL dd, y")
//     : label;

//   return (
//     <div className="w-full">
//       <label className="text-myGray text-sm">{label}</label>

//       <Popover>
//         <PopoverTrigger asChild>
//           <Input
//             readOnly
//             value={displayText}
//             className={`mt-[5px] cursor-pointer border-2 rounded-[8px] h-9 px-2 text-start ${
//               !(value?.from || value?.to) ? "text-gray-400" : ""
//             } ${error ? "border-red-500" : "border-gray-300"}`}
//           />
//         </PopoverTrigger>
//         <PopoverContent className="w-auto p-0">
//           <Calendar
//             mode="range"
//             selected={value}
//             onSelect={(range) => {
//               if (!range) return;

//               setValue({
//                 from: range.from ? startOfDay(range.from) : undefined,
//                 to: range.to ? endOfDay(range.to) : undefined,
//               });
//             }}
//             numberOfMonths={2}
//           />
//         </PopoverContent>
//       </Popover>
//     </div>
//   );
// }
"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { endOfDay, format, startOfDay } from "date-fns";
import { type DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";

export default function DateRangePicker({
  id,
  value,
  label,
  error,
  onChange,
}: {
  id: string;
  value: DateRange | undefined;
  label: string;
  error?: string;
  onChange: any;
}) {
  const displayText = value?.from
    ? value.to
      ? `${format(value.from, "LLL dd, y")} - ${format(value.to, "LLL dd, y")}`
      : format(value.from, "LLL dd, y")
    : label;

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) return;

    const valueString = {
      from: range.from ? startOfDay(range.from).toISOString() : null,
      to: range.to ? endOfDay(range.to).toISOString() : null,
    };

    onChange({
      target: {
        id,
        value: valueString,
      },
    });
  };

  return (
    <div className="w-full">
      <label className="text-myGray text-sm">{label}</label>

      <Popover>
        <PopoverTrigger asChild>
          <Input
            readOnly
            value={displayText}
            className={`mt-[5px] cursor-pointer border-2 rounded-[8px] h-9 px-2 text-start ${
              !(value?.from || value?.to) ? "text-gray-400" : ""
            } ${error ? "border-red-500" : "border-gray-300"}`}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="range"
            required={false}
            selected={value}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import PanelFormInput from "../../inputs/panel-form-input";
import { Dropdown } from "../../inputs/drop-down";
import DateRangePicker from "../../inputs/date-range-picker";
import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNotificationsStore } from "@/app/store/useNotificationStore";

export default function FilterNotifications() {
  const { notificationTypeOptions, openFilterNotificationModal, toggleOpenFilterNotificationModal } =
    useNotificationsStore();

  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "";
  const search = searchParams.get("search") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const [searchInput, setSearchInput] = useState(search);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // search delay
  const handleSearch = (value: string) => {
    setSearchInput(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value.trim()) {
        params.set("search", value.trim());
      } else {
        params.delete("search");
      }

      params.set("page", "1");

      router.push(`?${params.toString()}`, { scroll: false });
    }, 500);
  };

  // change filter values
  const handleChange = (e: {
    target: {
      id: string;
      value: { from: string | null; to: string | null } | string;
    };
  }) => {
    const { id, value } = e.target;

    const params = new URLSearchParams(searchParams.toString());

    if (id === "date_range" && typeof value !== "string") {
      if (value.from) params.set("from", value.from);
      else params.delete("from");

      if (value.to) params.set("to", value.to);
      else params.delete("to");
    } else if (typeof value === "string") {
      if (value) params.set(id, value);
      else params.delete(id);
    }

    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Clear all filters
  const clearFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    setSearchInput("");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      className={`${
        openFilterNotificationModal ? "" : "opacity-0 pointer-events-none"
      } fixed inset-0 z-20 flex items-center justify-center duration-200`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity ${
          openFilterNotificationModal ? "opacity-50" : "opacity-0"
        }`}
        onClick={() => {
          toggleOpenFilterNotificationModal();
        }}
      ></div>

      <div
        className={`bg-white rounded-[20px] sm:rounded-[30px] shadow-lg py-4 px-3 sm:py-6 sm:px-5 w-full sm:w-[600px] mx-[10px] z-[22] duration-200 flex flex-col gap-y-[10px] max-h-[80vh] ${
          openFilterNotificationModal
            ? "scale-100 opacity-100"
            : "scale-90 opacity-0"
        }`}
      >
        <h2 className="text-lg ">გაფილტრე შეტყობინებები</h2>

        <hr />

        <div className="flex-1 overflow-y-auto showScroll flex flex-col gap-[10px]">
          <PanelFormInput
            id="search"
            value={searchInput}
            label="ფილტრი"
            placeholder="მაგ: შეკვეთა №94..."
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Dropdown
            data={notificationTypeOptions}
            id="type"
            value={type}
            label="ტიპი"
            placeholder="მაგ: შეკვეთები"
            valueKey="nameEng"
            labelKey="name"
            onChange={handleChange}
          />
          <DateRangePicker
            id="date_range"
            value={{
              from: from ? new Date(from) : undefined,
              to: to ? new Date(to) : undefined,
            }}
            label="თარიღი"
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-3 justify-end">
          {(searchInput || type || from || to) && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="cursor-pointer border-red-500 text-red-600"
            >
              ფილტრის გასუფთავება
            </Button>
          )}
          <Button
            onClick={() => {
              toggleOpenFilterNotificationModal();
            }}
            className="cursor-pointer"
          >
            დახურვა
          </Button>
        </div>
      </div>
    </div>
  );
}

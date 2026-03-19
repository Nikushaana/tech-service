"use client";

import { Button } from "@/components/ui/button";
import PanelFormInput from "../../inputs/panel-form-input";
import { Dropdown } from "../../inputs/drop-down";
import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransactionsStore } from "@/app/store/useTransactionStore";

export default function FilterTransactions() {
  const { openFilterTransactionModal, toggleOpenFilterTransactionModal, transactionStatus, transactionType } =
    useTransactionsStore();

  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "";
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";

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
  const handleChange = (e: { target: { id: string; value: string } }) => {
    const { id, value } = e.target;

    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(id, value);
    else params.delete(id);

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
        openFilterTransactionModal ? "" : "opacity-0 pointer-events-none"
      } fixed inset-0 z-20 flex items-center justify-center duration-200`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity ${
          openFilterTransactionModal ? "opacity-50" : "opacity-0"
        }`}
        onClick={() => {
          toggleOpenFilterTransactionModal();
        }}
      ></div>

      <div
        className={`bg-white rounded-[20px] sm:rounded-[30px] shadow-lg py-4 px-3 sm:py-6 sm:px-5 w-full sm:w-[600px] mx-[10px] z-[22] duration-200 flex flex-col gap-y-[10px] max-h-[80vh] ${
          openFilterTransactionModal
            ? "scale-100 opacity-100"
            : "scale-90 opacity-0"
        }`}
      >
        <h2 className="text-lg ">გაფილტრე ტრანზაქციები</h2>

        <hr />

        <div className="flex-1 overflow-y-auto showScroll flex flex-col gap-[10px]">
          <PanelFormInput
            id="search"
            value={searchInput}
            label="ფილტრი"
            placeholder="მაგ: შეკვეთა №8..."
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Dropdown
            data={transactionStatus}
            id="status"
            value={status}
            label="სტატუსი"
            placeholder="მაგ: pending"
            valueKey="name"
            labelKey="name"
            onChange={handleChange}
          />
          <Dropdown
            data={transactionType}
            id="type"
            value={type}
            label="ტიპი"
            placeholder="მაგ: ჩამოჭრა"
            valueKey="nameEng"
            labelKey="name"
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-3 justify-end">
          {(searchInput || status || type) && (
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
              toggleOpenFilterTransactionModal();
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

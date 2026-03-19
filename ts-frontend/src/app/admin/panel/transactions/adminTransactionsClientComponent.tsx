"use client";

import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/app/lib/api/axios";
import { providerLabels } from "@/app/utils/providerLabels";
import { transactionTypeLabels } from "@/app/utils/transactionTypeLabels";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/app/components/pagination/pagination";
import LinearLoader from "@/app/components/linearLoader";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { Dropdown } from "@/app/components/inputs/drop-down";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

const fetchAdminTransactions = async (
  page: number,
  type: string,
  status: string,
  search: string,
) => {
  const params = new URLSearchParams();

  if (page) params.set("page", page.toString());
  if (type) params.set("type", type);
  if (status) params.set("status", status);
  if (search) params.set("search", search);

  const { data } = await api.get(`admin/transactions?${params.toString()}`);
  return data;
};

const transactionType = [
  { id: 1, name: "ჩამოჭრა", nameEng: "debit" },
  { id: 2, name: "ჩარიცხვა", nameEng: "credit" },
];

const transactionStatus = [
  { id: 1, name: "pending" },
  { id: 2, name: "paid" },
  { id: 3, name: "failed" },
  { id: 4, name: "refunded" },
];

export default function AdminTransactionsClientComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
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

  const { data: transactions, isFetching } = useQuery({
    queryKey: ["adminTransactions", page, type, status, search],
    queryFn: () => fetchAdminTransactions(page, type, status, search),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  const handleChange = (e: { target: { id: string; value: string } }) => {
    const { id, value } = e.target;

    const params = new URLSearchParams(searchParams.toString());

    params.set(id, value);

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
    <div className="w-full space-y-1">
      <h2 className="text-xl mb-2">ტრანზაქციები</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-4 gap-[20px] items-end">
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
        {(searchInput || type || status) && (
          <Button
            onClick={clearFilters}
            variant="outline"
            className="cursor-pointer border-red-500 text-red-600"
          >
            გასუფთავება
          </Button>
        )}
      </div>

      <LinearLoader isLoading={isFetching} />

      <div className="overflow-x-auto w-full">
        <Table className="min-w-[900px] table-auto">
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100">
              <TableHead>ID</TableHead>
              <TableHead>თანხა (₾)</TableHead>
              <TableHead>დანიშნულება</TableHead>
              <TableHead>სტატუსი</TableHead>
              <TableHead>ტრანზაქციის ტიპი</TableHead>
              <TableHead>გადახდის მეთოდი</TableHead>
              <TableHead className="text-right">თარიღი</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!transactions ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-gray-500"
                >
                  ინფორმაცია იძებნება...
                </TableCell>
              </TableRow>
            ) : transactions?.total === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-gray-500"
                >
                  ინფორმაცია არ მოიძებნა
                </TableCell>
              </TableRow>
            ) : (
              transactions?.data?.map((transaction: any) => (
                <TableRow key={transaction.id} className="hover:bg-gray-100 h-13">
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>{transaction.amount} ₾</TableCell>
                  <TableCell>{transaction.reason}</TableCell>
                  <TableCell>{transaction.status}</TableCell>
                  <TableCell>
                    {transactionTypeLabels[transaction.type] ||
                      transaction.type}
                  </TableCell>
                  <TableCell>
                    {providerLabels[transaction.provider] ||
                      transaction.provider}
                  </TableCell>
                  <TableCell className="text-right">
                    {dayjs(transaction.created_at).format("DD.MM.YYYY HH:mm")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Pagination totalPages={transactions?.totalPages} currentPage={page} />
      </div>
    </div>
  );
}

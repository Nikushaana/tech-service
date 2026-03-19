"use client";

import dayjs from "dayjs";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import Pagination from "@/app/components/pagination/pagination";
import LinearLoader from "@/app/components/linearLoader";
import { Button } from "@/components/ui/button";
import { CiFilter } from "react-icons/ci";
import { useTransactionsStore } from "@/app/store/useTransactionStore";

const fetchUserTransactions = async (
  userType: ClientRole,
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

  const { data } = await api.get(
    `${userType}/transactions?${params.toString()}`,
  );
  return data;
};

export default function UserTransactionsClientComponent() {
  const { userType } = useParams<{
    userType: ClientRole;
  }>();

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const type = searchParams.get("type") || "";
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";

  const { toggleOpenFilterTransactionModal, transactionType } =
    useTransactionsStore();
  const typeFilters = [{ id: 1, name: "ყველა", nameEng: "" }, ...transactionType];

  const { data: transactions, isFetching } = useQuery({
    queryKey: ["userTransactions", page, userType, type, status, search],
    queryFn: () => fetchUserTransactions(userType, page, type, status, search),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("type", value);
    } else {
      params.delete("type");
    }

    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const countFilter = [type, status, search].filter(Boolean).length;

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center gap-2 justify-between">
        <h1 className="text-xl mb-2">ტრანზაქციები</h1>
        <Button
          onClick={toggleOpenFilterTransactionModal}
          variant="outline"
          className="cursor-pointer"
        >
          <CiFilter className="size-4" />{" "}
          <p className="hidden sm:flex">
            ფილტრი {countFilter !== 0 && `(${countFilter})`}
          </p>
        </Button>
      </div>

      <div className="flex items-center overflow-x-auto">
        {typeFilters.map((type1) => {
          const isActive = type === type1.nameEng;

          return (
            <button
              key={type1.id || "all"}
              onClick={() => handleChange(type1.nameEng)}
              className={`px-2 sm:px-4 py-3 sm:py-1.5 text-[13px] cursor-pointer duration-100 border-b-1 shrink-0
        ${
          isActive
            ? "text-myLightBlue border-b-myLightBlue"
            : "hover:text-myLightBlue border-b-transparent hover:border-b-myLightBlue"
        }`}
            >
              {type1.name}
            </button>
          );
        })}
      </div>

      <LinearLoader isLoading={isFetching} />

      <div className="overflow-x-auto w-full">
        <Table className="min-w-[900px] table-auto">
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100">
              <TableHead>ID</TableHead>
              <TableHead>თანხა</TableHead>
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

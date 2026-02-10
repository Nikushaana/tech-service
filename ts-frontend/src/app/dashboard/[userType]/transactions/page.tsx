"use client";

import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { axiosCompany, axiosIndividual } from "@/app/lib/api/axios";
import { providerLabels } from "@/app/utils/providerLabels";
import { transactionTypeLabels } from "@/app/utils/transactionTypeLabels";
import Pagination from "@/app/components/pagination/pagination";

const fetchUserTransactions = async (page: number, userType: ClientRole) => {
  const api = userType === "company" ? axiosCompany : axiosIndividual;
  const { data } = await api.get(`${userType}/transactions?page=${page}`);
  return data;
};

export default function Page() {
  const { userType } = useParams<{
    userType: ClientRole;
  }>();

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { data: transactions, isFetching } = useQuery({
    queryKey: ["userTransactions", userType, page],
    queryFn: () => fetchUserTransactions(page, userType),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  return (
    <div className={`w-full flex flex-col gap-y-2`}>
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-2">
        <h2 className="text-xl font-semibold mb-2">ტრანზაქციები</h2>

        <div className="flex justify-end">
          <Pagination
            totalPages={transactions?.totalPages}
            currentPage={page}
          />
        </div>

        {isFetching && (
          <div className="flex justify-center w-full mt-10">
            <Loader2Icon className="animate-spin size-6 text-gray-600" />
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <Table className="min-w-[900px] table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">თანხა</TableHead>
                <TableHead className="font-semibold">დანიშნულება</TableHead>
                <TableHead className="font-semibold">სტატუსი</TableHead>
                <TableHead className="font-semibold">
                  ტრანზაქციის ტიპი
                </TableHead>
                <TableHead className="font-semibold">გადახდის მეთოდი</TableHead>
                <TableHead className="font-semibold text-right">
                  თარიღი
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.total === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია არ მოიძებნა
                  </TableCell>
                </TableRow>
              ) : (
                transactions?.data?.map((transaction: any) => (
                  <TableRow key={transaction.id} className="hover:bg-gray-50">
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
          <Pagination
            totalPages={transactions?.totalPages}
            currentPage={page}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { axiosAdmin } from "@/app/lib/api/axios";
import { providerLabels } from "@/app/utils/providerLabels";
import { transactionTypeLabels } from "@/app/utils/transactionTypeLabels";

const fetchAdminTransactions = async () => {
  const { data } = await axiosAdmin.get(`admin/transactions`);
  return data;
};

export default function Page() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["adminTransactions"],
    queryFn: fetchAdminTransactions,
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className={`w-full flex flex-col gap-y-2`}>
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">ტრანზაქციები</h2>
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[900px] table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">თანხა (₾)</TableHead>
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
              {transactions?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია არ მოიძებნა
                  </TableCell>
                </TableRow>
              ) : (
                transactions?.map((transaction: any) => (
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
      </div>
    </div>
  );
}

"use client";

import { Dropdown } from "@/app/components/inputs/drop-down";
import Pagination from "@/app/components/pagination/pagination";
import { axiosAdmin } from "@/app/lib/api/axios";
import { useRegisterStore } from "@/app/store/registerStore";
import { formatPhone } from "@/app/utils/formatPhone";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { BsEye } from "react-icons/bs";
import { IoPersonSharp } from "react-icons/io5";

const fetchAdminStaff = async (page: number, type: string) => {
  const { data } = await axiosAdmin.get(
    `admin/${type == "ტექნიკოსი" ? "technicians" : "deliveries"}?page=${page}`,
  );
  return data;
};

const staffType = [
  { id: 1, name: "ტექნიკოსი" },
  { id: 2, name: "კურიერი" },
];

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const type = searchParams.get("type") || "ტექნიკოსი";

  const { setValues } = useRegisterStore();

  useEffect(() => {
    setValues("role", type === "კურიერი" ? "delivery" : "technician");
  }, [type, setValues]);

  const { data: staff, isFetching } = useQuery({
    queryKey: ["adminStaff", type, page],
    queryFn: () => fetchAdminStaff(page, type),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  });

  const handleChange = (e: { target: { id: string; value: string } }) => {
    const { id, value } = e.target;

    const params = new URLSearchParams(searchParams.toString());

    params.set(id, value);

    if (id === "type") {
      params.set("page", "1");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col items-center gap-y-2 w-full">
      <Link
        href={"/admin/panel/staff/send-register-code"}
        className="w-auto self-end"
      >
        <Button className="h-[45px] px-6 text-white cursor-pointer">
          {type}ს რეგისტრაცია
        </Button>
      </Link>
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-2">
        <h2 className="text-xl font-semibold mb-2">თანამშრომლები</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-4 gap-[20px] items-end">
          <Dropdown
            data={staffType}
            id="type"
            value={type}
            label="ტიპი"
            valueKey="name"
            labelKey="name"
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end">
          <Pagination totalPages={staff?.totalPages} currentPage={page} />
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
                <TableHead className="font-semibold">ფოტო</TableHead>
                <TableHead className="font-semibold">სახელი</TableHead>
                <TableHead className="font-semibold">გვარი</TableHead>
                <TableHead className="font-semibold">
                  ტელეფონის ნომერი
                </TableHead>
                <TableHead className="font-semibold">სტატუსი</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff?.total === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია არ მოიძებნა
                  </TableCell>
                </TableRow>
              ) : (
                staff?.data?.map((staffMember: User) => (
                  <TableRow key={staffMember.id} className="hover:bg-gray-50">
                    <TableCell>{staffMember.id}</TableCell>
                    <TableCell>
                      <div className="w-[35px] h-[35px] rounded-full overflow-hidden bg-myLightBlue text-white flex items-center justify-center">
                        {staffMember.images && staffMember.images[0] ? (
                          <img
                            src={staffMember.images[0]}
                            alt={staffMember.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <IoPersonSharp />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{staffMember.name}</TableCell>
                    <TableCell>{staffMember.lastName}</TableCell>
                    <TableCell>{formatPhone(staffMember.phone)}</TableCell>
                    <TableCell>
                      {staffMember.status ? "აქტიური" : "დაბლოკილი"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/panel/staff/${staffMember.role}-${staffMember.id}`}
                      >
                        <Button
                          variant="secondary"
                          size="icon"
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          <BsEye className="size-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <Pagination totalPages={staff?.totalPages} currentPage={page} />
        </div>
      </div>
    </div>
  );
}

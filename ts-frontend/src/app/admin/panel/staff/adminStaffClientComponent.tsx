"use client";

import { Dropdown } from "@/app/components/inputs/drop-down";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import LinearLoader from "@/app/components/linearLoader";
import Pagination from "@/app/components/pagination/pagination";
import { api } from "@/app/lib/api/axios";
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
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BsEye } from "react-icons/bs";
import { IoPersonSharp } from "react-icons/io5";

const fetchAdminStaff = async (
  type: string,
  page: number,
  status: string,
  search: string,
) => {
  const params = new URLSearchParams();

  if (page) params.set("page", page.toString());
  if (status) params.set("status", status);
  if (search) params.set("search", search);

  const { data } = await api.get(
    `admin/${type == "ტექნიკოსი" ? "technicians" : "deliveries"}?${params.toString()}`,
  );
  return data;
};

const staffType = [
  { id: 1, name: "ტექნიკოსი" },
  { id: 2, name: "კურიერი" },
];

const userStatus = [
  { id: 1, name: "აქტიური", status: true },
  { id: 2, name: "დაბლოკილი", status: false },
];

export default function AdminStaffClientComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const type = searchParams.get("type") || "ტექნიკოსი";
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";

  const { values, setValues, resetValues } = useRegisterStore();

  useEffect(() => {
    if (values) resetValues();
    setValues("role", type === "კურიერი" ? "delivery" : "technician");
  }, [type, setValues]);

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

  const { data: staff, isFetching } = useQuery({
    queryKey: ["adminStaff", type, page, status, search],
    queryFn: () => fetchAdminStaff(type, page, status, search),
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
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <h2 className="text-xl mb-2">თანამშრომლები</h2>
        <Link
          href={"/admin/panel/staff/send-register-code"}
          className=""
        >
          <Button className="h-[45px] px-6 text-white cursor-pointer">
            {type}ს რეგისტრაცია
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-4 gap-[20px] items-end">
        <Dropdown
          data={staffType}
          id="type"
          value={type}
          label="ტიპი"
          placeholder="მაგ: ტექნიკოსი"
          valueKey="name"
          labelKey="name"
          onChange={handleChange}
        />
        <PanelFormInput
          id="search"
          value={searchInput}
          label="ფილტრი"
          placeholder="მაგ: ტელ, სახ, გვარ"
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Dropdown
          data={userStatus}
          id="status"
          value={status}
          label="სტატუსი"
          placeholder="მაგ: აქტიური"
          valueKey="status"
          labelKey="name"
          onChange={handleChange}
        />
        <Button
          onClick={clearFilters}
          variant="outline"
          className="cursor-pointer border-red-500 text-red-600"
        >
          გასუფთავება
        </Button>
      </div>

      <LinearLoader isLoading={isFetching} />

      <div className="overflow-x-auto w-full">
        <Table className="min-w-[900px] table-auto">
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100">
              <TableHead>ID</TableHead>
              <TableHead>ფოტო</TableHead>
              <TableHead>სახელი</TableHead>
              <TableHead>გვარი</TableHead>
              <TableHead>ტელეფონის ნომერი</TableHead>
              <TableHead>სტატუსი</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!staff ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-gray-500"
                >
                  ინფორმაცია იძებნება...
                </TableCell>
              </TableRow>
            ) : staff?.total === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-gray-500"
                >
                  ინფორმაცია არ მოიძებნა
                </TableCell>
              </TableRow>
            ) : (
              staff?.data?.map((staffMember: User) => (
                <TableRow key={staffMember.id} className="hover:bg-gray-100">
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
                        className="bg-myLightBlue hover:bg-myBlue text-white cursor-pointer rounded-lg"
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
  );
}

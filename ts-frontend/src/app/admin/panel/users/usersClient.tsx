"use client";

import { axiosAdmin } from "@/app/api/axios";
import { Dropdown } from "@/app/components/inputs/drop-down";
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
import { useState } from "react";
import { BsEye } from "react-icons/bs";
import { IoPersonSharp } from "react-icons/io5";

const fetchAdminUsers = async (filters: { type: string }) => {
  const { data } = await axiosAdmin.get(
    `admin/${filters.type == "ფიზიკური პირი" ? "individuals" : "companies"}`
  );
  return data;
};

const userType = [
  { id: 1, name: "ფიზიკური პირი" },
  { id: 2, name: "იურიდიული პირი" },
];

export default function UsersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    type: searchParams.get("type") ?? "ფიზიკური პირი",
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ["adminUsers", filters],
    queryFn: () => fetchAdminUsers(filters),
    staleTime: 1000 * 60 * 10,
  });

  const handleChange = (e: { target: { id: string; value: string } }) => {
    const { id, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [id]: value,
    }));

    const params = new URLSearchParams(searchParams.toString());

    params.set(id, value);

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h2 className="text-xl font-semibold mb-4">მომხმარებლები</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-4 gap-[20px] items-end">
        <Dropdown
          data={userType}
          id="type"
          value={filters.type}
          label="ტიპი"
          valueKey="name"
          labelKey="name"
          onChange={handleChange}
        />
      </div>
      {isLoading ? (
        <div className="flex justify-center w-full mt-10">
          <Loader2Icon className="animate-spin size-6 text-gray-600" />
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[900px] table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">ფოტო</TableHead>
                {filters.type == "ფიზიკური პირი" ? (
                  <>
                    <TableHead className="font-semibold">სახელი</TableHead>
                    <TableHead className="font-semibold">გვარი</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="font-semibold">
                      კომპანიის სახელი
                    </TableHead>
                    <TableHead className="font-semibold">
                      საიდენტიფიკაციო კოდი
                    </TableHead>
                    <TableHead className="font-semibold">
                      წარმომადგენელი
                    </TableHead>
                  </>
                )}
                <TableHead className="font-semibold">
                  ტელეფონის ნომერი
                </TableHead>
                <TableHead className="font-semibold">სტატუსი</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია არ მოიძებნა
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: User) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <div className="w-[35px] h-[35px] rounded-full overflow-hidden bg-myLightBlue text-white flex items-center justify-center">
                        {user.images && user.images[0] ? (
                          <img
                            src={user.images[0]}
                            alt={user.name || user.companyName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <IoPersonSharp />
                        )}
                      </div>
                    </TableCell>
                    {filters.type == "ფიზიკური პირი" ? (
                      <>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.lastName}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{user.companyName}</TableCell>
                        <TableCell>{user.companyIdentificationCode}</TableCell>
                        <TableCell>
                          {user.companyAgentName +
                            " " +
                            user.companyAgentLastName}
                        </TableCell>
                      </>
                    )}
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      {user.status ? "აქტიური" : "დაბლოკილი"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/panel/users/${
                          filters.type == "ფიზიკური პირი"
                            ? "individuals-"
                            : "companies-"
                        }${user.id}`}
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
      )}
    </div>
  );
}

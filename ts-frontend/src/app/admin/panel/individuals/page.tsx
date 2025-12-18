"use client";

import { axiosAdmin } from "@/app/api/axios";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BsEye } from "react-icons/bs";
import { IoPersonSharp } from "react-icons/io5";

export default function Page() {
  const [individuals, setIndividuals] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIndividuals = () => {
    setLoading(true);
    axiosAdmin
      .get("admin/individuals")
      .then(({ data }) => setIndividuals(data))
      .catch((err) => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIndividuals();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h2 className="text-xl font-semibold mb-4">კერძო მომხმარებლები</h2>
      <div className="overflow-x-auto w-full">
        <Table className="min-w-[900px] table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">ID</TableHead>
              <TableHead className="font-semibold">ფოტო</TableHead>
              <TableHead className="font-semibold">სახელი</TableHead>
              <TableHead className="font-semibold">გვარი</TableHead>
              <TableHead className="font-semibold">სტატუსი</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {individuals.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-gray-500"
                >
                  ინფორმაცია არ მოიძებნა
                </TableCell>
              </TableRow>
            ) : (
              individuals.map((individual) => (
                <TableRow key={individual.id} className="hover:bg-gray-50">
                  <TableCell>{individual.id}</TableCell>
                  <TableCell>
                    <div className="w-[35px] h-[35px] rounded-full overflow-hidden bg-myLightBlue text-white flex items-center justify-center">
                      {individual.images && individual.images[0] ? (
                        <img
                          src={individual.images[0]}
                          alt={individual.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <IoPersonSharp />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{individual.name}</TableCell>
                  <TableCell>{individual.lastName}</TableCell>
                  <TableCell>
                    {individual.status ? "აქტიური" : "დაბლოკილი"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/panel/individuals/${individual.id}`}>
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
    </div>
  );
}

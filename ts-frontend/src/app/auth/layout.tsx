"use client";

import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-y-5 items-center justify-center min-h-[80vh] px-4 pt-10 pb-36 relative overflow-hidden">
      {/* Background Images */}
      <img
        src="/images/2.webp"
        alt="logo"
        className="w-40 sm:w-60 md:w-[300px] xl:w-[400px] aspect-square rounded-full object-cover absolute top-0 left-[-30px] z-0 shadow-2xl blur-[2px] brightness-60"
      />
      <img
        src="/images/3.jpg"
        alt="logo"
        className="w-72 sm:w-[500px] xl:w-[700px] aspect-square rounded-full object-cover absolute bottom-[60px] right-[-80px] z-0 shadow-2xl blur-[2px] brightness-60"
      />

      {/* Card */}
      <div className="rounded-xl bg-gray-100 border-[1px] w-full max-w-sm sm:max-w-md md:max-w-lg p-6 sm:p-10 z-10 shadow-2xl">
        <div>{children}</div>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import StaffClient from "./staffClient";
import { Loader2Icon } from "lucide-react";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center w-full mt-10">
          <Loader2Icon className="animate-spin size-6 text-gray-600" />
        </div>
      }
    >
      <StaffClient />
    </Suspense>
  );
}

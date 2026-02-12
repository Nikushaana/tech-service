import { Suspense } from "react";
import { Loader2Icon } from "lucide-react";
import UserTransactionsClientComponent from "./userTransactionsClientComponent";

export default function page() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center w-full mt-10">
          <Loader2Icon className="animate-spin size-6 text-gray-600" />
        </div>
      }
    >
      <UserTransactionsClientComponent />
    </Suspense>
  );
}

import { Suspense } from "react";
import { Loader2Icon } from "lucide-react";
import UserReviewsClientComponent from "./userReviewsClientComponent";

export default function page() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center w-full mt-10">
          <Loader2Icon className="animate-spin size-6 text-gray-600" />
        </div>
      }
    >
      <UserReviewsClientComponent />
    </Suspense>
  );
}

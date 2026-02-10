import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Pagination({ totalPages, currentPage }: any) {
  const searchParams = useSearchParams();

  if (totalPages < 2) return;

  return (
    <div className="inline-flex gap-1">
      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1;

        // show first, last, current, current ±1, else ...
        if (
          page === 1 ||
          page === totalPages ||
          Math.abs(page - currentPage) <= 1
        ) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("page", page.toString());

          return (
            <Link
              key={page}
              href={`?${params.toString()}`}
              className={`w-8 h-10 flex items-center justify-center font-bold text-sm rounded-lg cursor-pointer border-2 ${
                currentPage === page && "border-myLightBlue"
              }`}
            >
              {page}
            </Link>
          );
        }

        // only show ... once
        if (
          i > 0 &&
          i < totalPages - 1 &&
          Math.abs(i + 1 - currentPage) === 2
        ) {
          return (
            <span
              key={page}
              className="w-8 h-10 flex items-center justify-center font-bold text-sm"
            >
              ...
            </span>
          );
        }

        return null;
      })}
    </div>
  );
}

import Link from "next/link";

export default function Pagination({ totalPages, currentPage }: any) {
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
          return (
            <Link
              key={page}
              href={`?page=${page}`}
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

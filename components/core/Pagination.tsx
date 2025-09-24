import { SearchParams } from "next/dist/server/request/search-params";
import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Pagination as ShadcnPagination,
} from "@/components/ui/pagination";
import { getSearchParamsFromObject } from "@/lib/url";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  searchParams: SearchParams;
  className?: React.ComponentProps<typeof ShadcnPagination>["className"];
}

export function Pagination({ page, pageSize, total, searchParams, className }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  const pages = Array.from({ length: 5 }, (_, i) => page - 2 + i).filter(
    (p) => p > 0 && p <= totalPages,
  );

  const baseSearchParams = getSearchParamsFromObject(searchParams);

  const getPagedSearchParams = (page: string | number) => {
    const searchParams = new URLSearchParams(baseSearchParams);
    searchParams.set("page", String(page));

    return searchParams;
  };

  return (
    <ShadcnPagination className={className}>
      <PaginationContent>
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious href={`?${getPagedSearchParams(page)}`} />
          </PaginationItem>
        )}

        {pages.map((p) => (
          <PaginationItem key={`page-${p}`}>
            <PaginationLink
              href={`?${getPagedSearchParams(p)}`}
              isActive={p === page}
              className={cn({ "pointer-events-none": p === page })}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {page < totalPages && (
          <PaginationItem>
            <PaginationNext href={`?${getPagedSearchParams(page + 1)}`} />
          </PaginationItem>
        )}
      </PaginationContent>
    </ShadcnPagination>
  );
}

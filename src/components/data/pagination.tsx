import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  totalLabel: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
};

export function Pagination({ totalLabel, page = 1, totalPages = 3, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  function goTo(target: number) {
    if (target < 1 || target > totalPages) return;
    onPageChange?.(target);
  }

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-white text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} aria-hidden />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            aria-label={`Página ${p}`}
            aria-current={p === page ? "page" : undefined}
            onClick={() => goTo(p)}
            className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-semibold transition ${
              p === page
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-ink hover:border-ink"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          aria-label="Próxima página"
          disabled={page >= totalPages}
          onClick={() => goTo(page + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-white text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>

      <p className="rounded-md border border-line bg-white/80 px-3 py-2 text-sm font-medium text-muted">
        {totalLabel}
      </p>
    </div>
  );
}
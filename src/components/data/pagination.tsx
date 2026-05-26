import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({ totalLabel }: { totalLabel: string }) {
  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button variant="secondary" className="h-9 w-9 px-0" aria-label="Página anterior">
          <ChevronLeft size={16} aria-hidden />
        </Button>
        <Button className="h-9 w-9 px-0">1</Button>
        <Button variant="secondary" className="h-9 w-9 px-0">
          2
        </Button>
        <Button variant="secondary" className="h-9 w-9 px-0">
          3
        </Button>
        <Button variant="secondary" className="h-9 w-9 px-0" aria-label="Próxima página">
          <ChevronRight size={16} aria-hidden />
        </Button>
      </div>
      <p className="rounded-md border border-line bg-white/80 px-3 py-2 text-sm font-medium text-muted">{totalLabel}</p>
    </div>
  );
}

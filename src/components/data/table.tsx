import { cn } from "@/lib/utils";

export function Table({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-line bg-white shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

export function Th({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("px-4 py-3 text-[11px] font-semibold uppercase tracking-normal", className)} {...props}>
      {children}
    </th>
  );
}

export function Td({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("border-t border-neutral-200 px-4 py-3 text-sm text-neutral-700", className)} {...props}>
      {children}
    </td>
  );
}

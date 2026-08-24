import { cn } from "@/lib/utils";
import type { LotSpec } from "@/types";

/** Grade tabular de metadados, usada em fichas de lote e de leilão. */
export function SpecGrid({
  specs,
  columns = 2,
  className,
}: {
  specs: LotSpec[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const columnClass = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" }[
    columns
  ];

  return (
    <div className={cn("grid gap-y-4 border-t border-border pt-4", columnClass, className)}>
      {specs.map((spec) => (
        <div key={spec.label}>
          <p className="meta-label">{spec.label}</p>
          <p className="text-sm font-bold">{spec.value}</p>
        </div>
      ))}
    </div>
  );
}

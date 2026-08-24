import { cn } from "@/lib/utils";
import { statusLabels, type AuctionStatus } from "@/types";

const styles: Record<AuctionStatus, string> = {
  "ao-vivo": "border-live text-live",
  agendado: "border-primary text-primary",
  encerrado: "border-border text-muted-foreground",
};

export function StatusBadge({
  status,
  className,
}: {
  status: AuctionStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
        styles[status],
        className,
      )}
    >
      {status === "ao-vivo" ? <span className="size-1.5 rounded-full bg-live animate-live" /> : null}
      {statusLabels[status]}
    </span>
  );
}

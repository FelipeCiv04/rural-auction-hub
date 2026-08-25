import { cn } from "@/lib/utils";
import { statusLabels, type AuctionStatus } from "@/types";

const styles: Record<AuctionStatus, string> = {
  "ao-vivo": "border-live/50 bg-live/15 text-live",
  agendado: "border-primary/50 bg-primary/15 text-primary",
  encerrado: "border-border bg-background/70 text-muted-foreground",
};

export function StatusBadge({ status, className }: { status: AuctionStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] backdrop-blur",
        styles[status],
        className,
      )}
    >
      {status === "ao-vivo" ? (
        <span className="size-1.5 rounded-full bg-live animate-live" />
      ) : null}
      {statusLabels[status]}
    </span>
  );
}

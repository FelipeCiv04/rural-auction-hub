import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Botão do catálogo — pílula com acento ember, mantendo a identidade
 * moderna da plataforma de remates.
 */
export const catalogButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full eyebrow transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        solid: "bg-gradient-ember text-primary-foreground shadow-ember hover:opacity-90",
        outline: "border border-border text-foreground hover:border-primary/60 hover:text-primary",
        accent: "bg-foreground text-background hover:bg-foreground/90",
        ghost: "text-muted-foreground hover:text-primary",
      },
      size: {
        md: "px-7 py-3",
        sm: "px-4 py-2",
        block: "w-full px-8 py-4",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  },
);

export type CatalogButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof catalogButtonVariants>;

export function CatalogButton({ className, variant, size, ...props }: CatalogButtonProps) {
  return <button className={cn(catalogButtonVariants({ variant, size }), className)} {...props} />;
}

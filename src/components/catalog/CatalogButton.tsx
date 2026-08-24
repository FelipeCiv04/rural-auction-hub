import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Botão do catálogo — caixa alta, canto reto, sem sombra.
 * Substitui o botão shadcn padrão para manter a identidade agro-industrial.
 */
export const catalogButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 eyebrow transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        solid: "bg-foreground text-background hover:bg-primary",
        outline: "border border-border text-foreground hover:bg-surface-muted",
        accent: "bg-accent text-accent-foreground hover:bg-primary",
        ghost: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        md: "px-8 py-3",
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

import Link from "next/link";

import { cn } from "@/lib/utils";

interface SiteLogoProps {
  className?: string;
  href?: string;
  compact?: boolean;
}

export const SiteLogo = ({
  className,
  href = "/",
  compact = false,
}: SiteLogoProps) => {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-3", className)}
      aria-label="Franco Alonso"
    >
      <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-foreground text-sm font-extrabold text-background shadow-[3px_3px_0_0_hsl(var(--secondary))]">
        FA
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-sm font-extrabold tracking-[-0.03em]">
            Franco Alonso
          </span>
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            IA · Producto
          </span>
        </span>
      )}
    </Link>
  );
};

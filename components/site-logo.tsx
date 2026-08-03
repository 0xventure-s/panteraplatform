import Image from "next/image";
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
      aria-label="Kiwi Academia"
    >
      <span className="relative block h-12 w-12 shrink-0">
        <Image
          src="/thiings/kiwi.png"
          alt=""
          width={48}
          height={48}
          priority
          className="h-full w-full object-contain"
        />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block whitespace-nowrap text-base font-extrabold tracking-[-0.03em]">
            Kiwi Academia
          </span>
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            IA · Producto
          </span>
        </span>
      )}
    </Link>
  );
};

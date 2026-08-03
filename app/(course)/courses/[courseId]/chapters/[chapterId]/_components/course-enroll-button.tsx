"use client";

import Image from "next/image";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { formatPrice, PriceValue } from "@/lib/format";

interface CourseEnrollButtonProps {
  price: PriceValue;
  courseId: string;
}

export const CourseEnrollButton = ({
  price,
  courseId,
}: CourseEnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/courses/${courseId}/checkout`, {
        method: "POST",
      });
      const result = (await response.json()) as {
        error?: string;
        url?: string;
      };

      if (!response.ok || !result.url) {
        throw new Error(result.error || "No pudimos iniciar el pago");
      }

      window.location.assign(result.url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No pudimos iniciar el pago",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      aria-label={`Pagar ${formatPrice(price)} con Mercado Pago`}
      className="group w-full overflow-hidden rounded-[18px] border-2 border-[#0a0080]/15 bg-white px-4 py-3 text-[#0a0080] shadow-[4px_4px_0_#d6f5ff] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2abcff] hover:shadow-[6px_6px_0_#b9eeff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2abcff] focus-visible:ring-offset-2 active:translate-y-0 active:shadow-[2px_2px_0_#d6f5ff] disabled:pointer-events-none disabled:opacity-60"
    >
      <span className="flex items-center justify-between gap-4">
        <Image
          src="/mercado-pago.svg"
          alt="Mercado Pago"
          width={150}
          height={39}
          className="h-auto w-[118px] sm:w-[128px]"
        />
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e7f8ff] transition-transform duration-200 group-hover:translate-x-0.5">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          )}
        </span>
      </span>
      <span className="mt-2 flex items-center justify-between gap-3 border-t border-[#0a0080]/10 pt-2 text-[10px] font-extrabold uppercase tracking-[0.12em]">
        <span>{isLoading ? "Abriendo el pago" : "Continuar al pago"}</span>
        <span className="whitespace-nowrap text-xs tracking-normal">
          {formatPrice(price)}
        </span>
      </span>
    </button>
  );
};

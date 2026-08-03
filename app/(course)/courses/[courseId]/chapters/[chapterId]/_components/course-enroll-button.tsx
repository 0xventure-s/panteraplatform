"use client";

import axios from "axios";
import { CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
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

      const response = await axios.post(`/api/courses/${courseId}/checkout`)

      window.location.assign(response.data.url);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error
        : null;
      toast.error(message || "No pudimos iniciar el pago");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="lg"
      className="w-full rounded-full bg-[#009ee3] font-extrabold text-white hover:bg-[#008ac7]"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      Comprar con Mercado Pago · {formatPrice(price)}
    </Button>
  )
}

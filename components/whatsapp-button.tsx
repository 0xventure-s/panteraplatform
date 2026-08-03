import { MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  className?: string;
  compact?: boolean;
}

export const WhatsAppButton = ({
  className,
  compact = false,
}: WhatsAppButtonProps) => {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  const message =
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
    "Hola. Quiero consultar por los cursos de Kiwi Academia.";

  if (!number) {
    return null;
  }

  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-[#1fbd68] px-5 py-3 text-sm font-extrabold text-white shadow-[0_10px_30px_rgba(31,189,104,0.25)] transition hover:-translate-y-0.5 hover:bg-[#19a95b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
        compact && "h-12 w-12 p-0",
        className,
      )}
      aria-label="Consultar por WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
      {!compact && <span>Hablar por WhatsApp</span>}
    </a>
  );
};

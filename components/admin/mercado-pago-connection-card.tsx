"use client";

import axios from "axios";
import { CheckCircle2, CreditCard, ExternalLink, Link2, Loader2, Unplug } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";

interface MercadoPagoConnectionCardProps {
  connected: boolean;
  accountId?: string;
  liveMode?: boolean;
  updatedAt?: string;
}

export const MercadoPagoConnectionCard = ({
  connected,
  accountId,
  liveMode,
  updatedAt,
}: MercadoPagoConnectionCardProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const connect = () => {
    setIsLoading(true);
    window.location.assign("/api/mercadopago/oauth/start");
  };

  const disconnect = async () => {
    try {
      setIsLoading(true);
      await axios.delete("/api/mercadopago/connection");
      toast.success("Mercado Pago se desconectó");
      router.refresh();
    } catch {
      toast.error("No pudimos desconectar Mercado Pago");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[28px] border border-foreground/10 bg-card">
      <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-8">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[20px] bg-[#00a8e8]/10 text-[#0089c7]">
          <CreditCard className="h-8 w-8" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-extrabold tracking-[-0.03em]">Mercado Pago</h2>
            {connected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Conectado
              </span>
            ) : (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-extrabold text-muted-foreground">
                Sin conectar
              </span>
            )}
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Los cobros de los cursos se acreditan directamente en la cuenta autorizada.
          </p>
          {connected && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-muted-foreground">
              <span>Cuenta {accountId}</span>
              <span>{liveMode ? "Modo producción" : "Modo prueba"}</span>
              {updatedAt && <span>Actualizado {updatedAt}</span>}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {connected ? (
            <>
              <Button variant="outline" className="rounded-full" onClick={connect} disabled={isLoading}>
                <Link2 className="mr-2 h-4 w-4" />
                Volver a conectar
              </Button>
              <Button variant="ghost" className="rounded-full text-destructive" onClick={disconnect} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unplug className="mr-2 h-4 w-4" />}
                Desconectar
              </Button>
            </>
          ) : (
            <Button className="rounded-full bg-[#009ee3] text-white hover:bg-[#008ac7]" onClick={connect} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
              Conectar Mercado Pago
            </Button>
          )}
        </div>
      </div>
      <div className="border-t border-foreground/10 bg-muted/40 px-6 py-4 text-xs leading-5 text-muted-foreground md:px-8">
        La autorización se realiza en Mercado Pago. Las credenciales se guardan cifradas y nunca se muestran en el navegador.
      </div>
    </div>
  );
};

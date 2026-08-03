import { AlertCircle, CheckCircle2 } from "lucide-react";

import { MercadoPagoConnectionCard } from "@/components/admin/mercado-pago-connection-card";
import { db } from "@/lib/db";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const query = await searchParams;
  const connection = await db.mercadoPagoConnection.findUnique({
    where: { id: "primary" },
    select: {
      mercadoPagoUserId: true,
      liveMode: true,
      updatedAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-5 md:p-8 lg:p-10">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent">
          Administración
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">Integraciones</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Gestioná la cuenta que recibe los pagos de todos los cursos publicados.
        </p>
      </div>

      {query.connected && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
          <CheckCircle2 className="h-5 w-5" />
          Mercado Pago quedó conectado.
        </div>
      )}
      {query.error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
          <AlertCircle className="h-5 w-5" />
          No pudimos completar la conexión. Revisá la configuración e intentá nuevamente.
        </div>
      )}

      <MercadoPagoConnectionCard
        connected={Boolean(connection)}
        accountId={connection?.mercadoPagoUserId}
        liveMode={connection?.liveMode}
        updatedAt={connection?.updatedAt.toLocaleDateString("es-AR")}
      />
    </div>
  );
}

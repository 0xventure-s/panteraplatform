import { redirect } from "next/navigation";

import { getAnalytics } from "@/actions/get-analytics";

import { DataCard } from "./_components/data-card";
import { LazyChart } from "./_components/lazy-chart";
import { getAdminUserId } from "@/lib/admin";

const AnalyticsPage = async () => {
  const userId = await getAdminUserId();

  if (!userId) {
    return redirect("/dashboard");
  }

  const {
    data,
    totalRevenue,
    totalSales,
  } = await getAnalytics(userId);

  return ( 
    <div className="mx-auto max-w-7xl p-5 md:p-8 lg:p-10">
      <div className="mb-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent">Administración</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">Analíticas</h1>
        <p className="mt-3 text-sm text-muted-foreground">Solo se contabilizan pagos aprobados por Mercado Pago.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <DataCard
          label="Ingresos confirmados"
          value={totalRevenue}
          icon="wallet"
          shouldFormat
        />
        <DataCard
          label="Ventas aprobadas"
          value={totalSales}
          icon="credit-card"
        />
      </div>
      <LazyChart
        data={data}
      />
    </div>
   );
}
 
export default AnalyticsPage;

import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; courseId?: string }>;
}) {
  const query = await searchParams;
  const userId = await getCurrentUserId();
  const courseId = query.courseId;
  const purchase = userId && courseId
    ? await db.purchase.findUnique({
        where: { userId_courseId: { userId, courseId } },
      })
    : null;
  const isApproved = Boolean(purchase);
  const isFailure = query.status === "failure";
  const Icon = isApproved ? CheckCircle2 : isFailure ? AlertCircle : Clock3;

  return (
    <main className="paper-grid grid min-h-[calc(100vh-80px)] place-items-center px-5 py-16">
      <div className="w-full max-w-xl rounded-[32px] border border-foreground/10 bg-card p-8 text-center shadow-[0_30px_90px_rgba(30,24,20,0.12)] md:p-12">
        <span className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${isApproved ? "bg-emerald-100 text-emerald-700" : isFailure ? "bg-red-100 text-red-700" : "bg-secondary"}`}>
          <Icon className="h-8 w-8" />
        </span>
        <h1 className="mt-7 font-display text-5xl leading-none">
          {isApproved
            ? "Tu curso ya está disponible."
            : isFailure
              ? "El pago no se completó."
              : "Estamos confirmando el pago."}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-muted-foreground">
          {isApproved
            ? "El acceso quedó asociado a tu cuenta y podés empezar ahora."
            : isFailure
              ? "No se generó ningún cargo confirmado. Podés intentarlo nuevamente desde el curso."
              : "Mercado Pago puede demorar unos instantes en informar la acreditación. Actualizá esta página para revisar el estado."}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="rounded-full">
            <Link href={courseId ? `/cursos/${courseId}` : "/dashboard"}>
              {isApproved ? "Empezar curso" : "Volver"}
            </Link>
          </Button>
          {!isApproved && !isFailure && (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/pagos/resultado?status=pending&courseId=${courseId || ""}`}>Revisar estado</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}

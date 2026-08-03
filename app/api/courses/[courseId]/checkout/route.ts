import crypto from "crypto";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  createMercadoPagoPreference,
  getMercadoPagoAccess,
} from "@/lib/mercado-pago";
import { toPriceNumber } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    void req;
    const user = await getCurrentUser();
    const { courseId } = await params;

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: "Ingresá para comprar el curso." }, { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        isPublished: true,
      }
    });

    if (!course) {
      return NextResponse.json({ error: "El curso no está disponible." }, { status: 404 });
    }

    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId
        }
      }
    });

    if (purchase) {
      return NextResponse.json({ url: `/cursos/${course.id}` });
    }

    if (!course.price || toPriceNumber(course.price) <= 0) {
      return NextResponse.json({ error: "El curso todavía no tiene un precio válido." }, { status: 400 });
    }

    const mercadoPago = await getMercadoPagoAccess();

    if (!mercadoPago) {
      return NextResponse.json(
        { error: "Los pagos todavía no están habilitados." },
        { status: 503 },
      );
    }

    const email = user.email;
    const payment = await db.payment.create({
      data: {
        externalReference: crypto.randomUUID(),
        amount: course.price,
        currency: "ARS",
        payerEmail: email,
        userId: user.id,
        courseId: course.id,
      },
    });

    try {
      const preference = await createMercadoPagoPreference(
        mercadoPago.accessToken,
        {
          externalReference: payment.externalReference,
          title: course.title,
          price: toPriceNumber(course.price),
          payerEmail: email,
          courseId: course.id,
          paymentId: payment.id,
          userId: user.id,
        },
      );

      await db.payment.update({
        where: { id: payment.id },
        data: { preferenceId: preference.id },
      });

      const url = mercadoPago.liveMode
        ? preference.init_point
        : preference.sandbox_init_point || preference.init_point;

      if (!url) {
        throw new Error("Mercado Pago no devolvió una URL de pago");
      }

      return NextResponse.json({ url });
    } catch (error) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "REJECTED",
          providerStatus: "preference_error",
        },
      });
      throw error;
    }
  } catch (error) {
    console.error("[COURSE_ID_CHECKOUT]", error);
    const message = error instanceof Error ? error.message : "No pudimos iniciar el pago.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

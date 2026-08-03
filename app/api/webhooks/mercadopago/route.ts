import crypto from "crypto";
import { PaymentStatus } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  getMercadoPagoAccess,
  getMercadoPagoPayment,
} from "@/lib/mercado-pago";

const mapPaymentStatus = (status: string): PaymentStatus => {
  if (status === "approved") return PaymentStatus.APPROVED;
  if (status === "rejected") return PaymentStatus.REJECTED;
  if (status === "cancelled") return PaymentStatus.CANCELLED;
  if (status === "refunded" || status === "charged_back") return PaymentStatus.REFUNDED;
  return PaymentStatus.PENDING;
};

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length
    && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const verifySignature = ({
  dataId,
  requestId,
  signature,
}: {
  dataId: string;
  requestId: string | null;
  signature: string | null;
}) => {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return false;
  }

  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const [key, value] = part.trim().split("=");
      return [key, value];
    }),
  );
  const timestamp = parts.ts;
  const receivedHash = parts.v1;

  if (!timestamp || !receivedHash) {
    return false;
  }

  const manifest = [
    `id:${dataId.toLowerCase()};`,
    requestId ? `request-id:${requestId};` : "",
    `ts:${timestamp};`,
  ].join("");
  const expectedHash = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  return safeEqual(expectedHash, receivedHash);
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const dataId = request.nextUrl.searchParams.get("data.id")
    || body?.data?.id?.toString();

  if (!dataId) {
    return NextResponse.json({ received: true });
  }

  const isValid = verifySignature({
    dataId,
    requestId: request.headers.get("x-request-id"),
    signature: request.headers.get("x-signature"),
  });

  if (!isValid) {
    return new NextResponse("Firma inválida", { status: 401 });
  }

  try {
    const mercadoPago = await getMercadoPagoAccess();

    if (!mercadoPago) {
      return new NextResponse("Mercado Pago no está conectado", { status: 503 });
    }

    const providerPayment = await getMercadoPagoPayment(
      mercadoPago.accessToken,
      dataId,
    );
    const externalReference = providerPayment.external_reference;

    if (!externalReference) {
      return NextResponse.json({ received: true });
    }

    const payment = await db.payment.findUnique({
      where: { externalReference },
      include: {
        course: {
          select: {
            isPublished: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ received: true });
    }

    if (payment.status === PaymentStatus.APPROVED) {
      return payment.providerPaymentId === String(providerPayment.id)
        ? NextResponse.json({ received: true })
        : new NextResponse("El pago ya fue procesado", { status: 409 });
    }

    const amountMatches = Math.abs(
      Number(payment.amount.toString()) - providerPayment.transaction_amount,
    ) < 0.01;
    const currencyMatches = providerPayment.currency_id === payment.currency;
    const metadataMatches =
      providerPayment.metadata?.payment_id === payment.id &&
      providerPayment.metadata?.course_id === payment.courseId &&
      providerPayment.metadata?.user_id === payment.userId;

    if (!amountMatches || !currencyMatches || !metadataMatches) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          providerPaymentId: String(providerPayment.id),
          status: PaymentStatus.REJECTED,
          providerStatus: "payment_validation_mismatch",
        },
      });

      return new NextResponse("Los datos del pago no coinciden", { status: 409 });
    }

    const status = mapPaymentStatus(providerPayment.status);

    if (status === PaymentStatus.APPROVED && !payment.course.isPublished) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          providerPaymentId: String(providerPayment.id),
          status: PaymentStatus.REJECTED,
          providerStatus: "course_unavailable",
        },
      });

      return new NextResponse("El curso ya no está disponible", { status: 409 });
    }

    if (status === PaymentStatus.APPROVED) {
      await db.$transaction([
        db.payment.update({
          where: { id: payment.id },
          data: {
            providerPaymentId: String(providerPayment.id),
            status,
            providerStatus: providerPayment.status_detail || providerPayment.status,
            payerEmail: providerPayment.payer?.email || payment.payerEmail,
          },
        }),
        db.purchase.upsert({
          where: {
            userId_courseId: {
              userId: payment.userId,
              courseId: payment.courseId,
            },
          },
          create: {
            userId: payment.userId,
            courseId: payment.courseId,
            paymentId: payment.id,
          },
          update: {
            paymentId: payment.id,
          },
        }),
      ]);
      revalidateTag("community-leaderboard");
    } else if (status === PaymentStatus.REFUNDED) {
      await db.$transaction([
        db.payment.update({
          where: { id: payment.id },
          data: {
            providerPaymentId: String(providerPayment.id),
            status,
            providerStatus: providerPayment.status_detail || providerPayment.status,
          },
        }),
        db.purchase.deleteMany({
          where: { paymentId: payment.id },
        }),
      ]);
      revalidateTag("community-leaderboard");
    } else {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          providerPaymentId: String(providerPayment.id),
          status,
          providerStatus: providerPayment.status_detail || providerPayment.status,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[MERCADOPAGO_WEBHOOK]", error);
    return new NextResponse("Error al procesar la notificación", { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { getAdminUserId } from "@/lib/admin";
import { db } from "@/lib/db";

export async function DELETE() {
  if (!(await getAdminUserId())) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  await db.mercadoPagoConnection.deleteMany({
    where: { id: "primary" },
  });

  return new NextResponse(null, { status: 204 });
}

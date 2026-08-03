"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export const PasswordRecoveryForm = () => {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const result = await authClient.requestPasswordReset({
      email: email.trim().toLowerCase(),
      redirectTo: "/restablecer-clave",
    });

    setIsPending(false);

    if (result.error) {
      setError("No pudimos enviar el correo. Intentá nuevamente en unos minutos.");
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-[28px] border border-foreground/10 bg-card p-8 text-center shadow-[0_28px_90px_rgba(37,29,23,0.12)]">
        <p className="font-display text-4xl">Revisá tu correo.</p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Si existe una cuenta asociada, vas a recibir un enlace para elegir una nueva contraseña.
        </p>
        <Button asChild variant="outline" className="mt-7 rounded-full">
          <Link href="/sign-in">Volver al ingreso</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-foreground/10 bg-card p-6 shadow-[0_28px_90px_rgba(37,29,23,0.12)] sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">Recuperar acceso</p>
      <h1 className="mt-3 font-display text-4xl leading-none">Volvé a tu cuenta.</h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Te enviaremos un enlace seguro para crear una nueva contraseña.
      </p>
      <form onSubmit={onSubmit} className="mt-7 space-y-5">
        <label className="block space-y-2 text-sm font-bold">
          <span>Correo</span>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className="h-12 rounded-xl bg-background"
          />
        </label>
        {error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}
        <Button type="submit" disabled={isPending} className="h-12 w-full rounded-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enviar enlace
        </Button>
      </form>
      <Link href="/sign-in" className="mt-6 block text-center text-sm font-bold hover:text-accent">
        Volver al ingreso
      </Link>
    </div>
  );
};

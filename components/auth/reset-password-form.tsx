"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const invalidToken = searchParams.get("error") === "INVALID_TOKEN" || !token;
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [completed, setCompleted] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || password !== confirmation) {
      setError("Las contraseñas deben coincidir.");
      return;
    }

    setError(null);
    setIsPending(true);
    const result = await authClient.resetPassword({ newPassword: password, token });
    setIsPending(false);

    if (result.error) {
      setError("El enlace venció o ya fue utilizado.");
      return;
    }

    setCompleted(true);
  };

  if (invalidToken || completed) {
    return (
      <div className="rounded-[28px] border border-foreground/10 bg-card p-8 text-center shadow-[0_28px_90px_rgba(37,29,23,0.12)]">
        <h1 className="font-display text-4xl">
          {completed ? "Contraseña actualizada." : "El enlace ya no está disponible."}
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {completed ? "Ya podés ingresar con tu nueva contraseña." : "Solicitá un nuevo correo para continuar."}
        </p>
        <Button asChild className="mt-7 rounded-full">
          <Link href={completed ? "/sign-in" : "/recuperar-acceso"}>
            {completed ? "Ingresar" : "Pedir otro enlace"}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-foreground/10 bg-card p-6 shadow-[0_28px_90px_rgba(37,29,23,0.12)] sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">Nueva contraseña</p>
      <h1 className="mt-3 font-display text-4xl leading-none">Protegé tu acceso.</h1>
      <form onSubmit={onSubmit} className="mt-7 space-y-5">
        <label className="block space-y-2 text-sm font-bold">
          <span>Contraseña nueva</span>
          <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required className="h-12 rounded-xl bg-background" />
        </label>
        <label className="block space-y-2 text-sm font-bold">
          <span>Repetir contraseña</span>
          <Input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} required className="h-12 rounded-xl bg-background" />
        </label>
        {error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}
        <Button type="submit" disabled={isPending} className="h-12 w-full rounded-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar contraseña
        </Button>
      </form>
    </div>
  );
};

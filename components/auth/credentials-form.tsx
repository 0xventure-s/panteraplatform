"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";

const errorMessages: Record<string, string> = {
  "Invalid email or password": "El correo o la contraseña no coinciden.",
  "User already exists": "Ya existe una cuenta con ese correo.",
  "Password too short": "La contraseña debe tener al menos 8 caracteres.",
};

const getErrorMessage = (message?: string) =>
  (message && errorMessages[message]) ||
  "No pudimos completar el acceso. Revisá los datos e intentá nuevamente.";

export const CredentialsForm = ({ mode }: { mode: AuthMode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const isSignUp = mode === "sign-up";

  const requestedCallbackURL = searchParams.get("callbackURL");
  const callbackURL =
    requestedCallbackURL?.startsWith("/") && !requestedCallbackURL.startsWith("//")
      ? requestedCallbackURL
      : "/dashboard";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const result = isSignUp
      ? await authClient.signUp.email({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          callbackURL,
        })
      : await authClient.signIn.email({
          email: email.trim().toLowerCase(),
          password,
          callbackURL,
        });

    if (result.error) {
      setError(getErrorMessage(result.error.message));
      setIsPending(false);
      return;
    }

    router.push(callbackURL);
    router.refresh();
  };

  return (
    <div className="rounded-[28px] border border-foreground/10 bg-card p-6 shadow-[0_28px_90px_rgba(37,29,23,0.12)] sm:p-8">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">
          {isSignUp ? "Nueva cuenta" : "Tu campus"}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-none">
          {isSignUp ? "Empezá tu recorrido." : "Volvé a construir."}
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {isSignUp
            ? "Creá tu acceso para comprar cursos y guardar cada avance."
            : "Ingresá con el correo que usaste al registrarte."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-7 space-y-5">
        {isSignUp && (
          <label className="block space-y-2 text-sm font-bold">
            <span>Nombre</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              placeholder="Tu nombre"
              required
              className="h-12 rounded-xl bg-background"
            />
          </label>
        )}

        <label className="block space-y-2 text-sm font-bold">
          <span>Correo</span>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="nombre@correo.com"
            required
            className="h-12 rounded-xl bg-background"
          />
        </label>

        <label className="block space-y-2 text-sm font-bold">
          <span>Contraseña</span>
          <span className="relative block">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              minLength={8}
              required
              className="h-12 rounded-xl bg-background pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted-foreground transition hover:text-foreground"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
        </label>

        {!isSignUp && (
          <div className="text-right">
            <Link href="/recuperar-acceso" className="text-sm font-bold hover:text-accent">
              Olvidé mi contraseña
            </Link>
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={isPending} className="h-12 w-full rounded-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSignUp ? "Crear cuenta" : "Ingresar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignUp ? "¿Ya tenés una cuenta?" : "¿Todavía no tenés cuenta?"}{" "}
        <Link href={isSignUp ? "/sign-in" : "/sign-up"} className="font-extrabold text-foreground hover:text-accent">
          {isSignUp ? "Ingresar" : "Registrarme"}
        </Link>
      </p>
    </div>
  );
};

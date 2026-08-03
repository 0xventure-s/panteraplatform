import { ArrowRight, Bot, Boxes, Check, Sparkles, Workflow } from "lucide-react";
import Link from "next/link";

import { CourseTile } from "@/components/marketing/course-tile";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { db } from "@/lib/db";

const principles = [
  {
    icon: Bot,
    number: "01",
    title: "IA aplicada",
    text: "Herramientas y decisiones dentro de un proceso de producto real.",
  },
  {
    icon: Workflow,
    number: "02",
    title: "De idea a sistema",
    text: "Un recorrido concreto para diseñar, construir y poner en uso.",
  },
  {
    icon: Boxes,
    number: "03",
    title: "Aprender construyendo",
    text: "Cada concepto se convierte en una parte visible del producto.",
  },
];

export default async function HomePage() {
  const courses = await db.course.findMany({
    where: { isPublished: true },
    include: {
      category: true,
      chapters: {
        where: { isPublished: true },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <main>
      <section className="paper-grid relative overflow-hidden border-b border-foreground/10">
        <div className="mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background/80 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] backdrop-blur">
              <Sparkles className="h-4 w-4 text-accent" />
              IA para crear, no solo para mirar
            </div>
            <h1 className="font-display text-[clamp(4.25rem,10vw,8.75rem)] leading-[0.78] tracking-[-0.055em]">
              Construí
              <span className="block italic text-accent">productos</span>
              con IA.
            </h1>
            <p className="mt-9 max-w-xl text-lg font-medium leading-8 text-muted-foreground md:text-xl">
              Cursos de Franco Alonso para pasar de una idea a un producto que funciona, usando IA con criterio y dirección.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-14 rounded-full px-7 text-base">
                <Link href="/cursos">
                  Ver cursos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <WhatsAppButton />
            </div>
          </div>

          <div className="relative hidden min-h-[520px] lg:block" aria-hidden="true">
            <div className="soft-noise absolute inset-8 rotate-3 rounded-[48px] border border-foreground/10 bg-foreground shadow-[24px_30px_0_hsl(var(--secondary))]" />
            <div className="float-object absolute left-2 top-16 grid h-40 w-40 place-items-center rounded-[42px] bg-accent shadow-2xl">
              <Bot className="h-20 w-20" strokeWidth={1.4} />
            </div>
            <div className="float-object absolute bottom-12 right-0 grid h-48 w-48 place-items-center rounded-full bg-secondary shadow-2xl [animation-delay:-2.5s]">
              <Boxes className="h-24 w-24" strokeWidth={1.35} />
            </div>
            <div className="absolute left-40 top-52 max-w-[260px] -rotate-2 rounded-[28px] bg-background p-6 shadow-2xl">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
                Norte del curso
              </span>
              <p className="mt-4 font-display text-3xl leading-tight">
                Una idea deja de ser una idea cuando alguien puede usarla.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="metodo" className="border-b border-foreground/10 bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-secondary">
                El método
              </p>
              <h2 className="mt-5 max-w-md font-display text-5xl leading-[0.95] md:text-7xl">
                Menos teoría suelta. Más producto en movimiento.
              </h2>
            </div>
            <div className="grid gap-px overflow-hidden rounded-[28px] bg-background/15 md:grid-cols-3">
              {principles.map(({ icon: Icon, number, title, text }) => (
                <article key={number} className="bg-foreground p-7 md:min-h-[320px]">
                  <div className="flex items-center justify-between">
                    <Icon className="h-8 w-8 text-secondary" />
                    <span className="font-display text-2xl text-background/45">{number}</span>
                  </div>
                  <h3 className="mt-24 text-xl font-extrabold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-background/65">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="franco" className="border-b border-foreground/10 bg-secondary">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[0.7fr_1.3fr] lg:px-8 lg:py-24">
          <div className="flex items-start gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] bg-foreground text-lg font-extrabold text-background shadow-[5px_5px_0_hsl(var(--accent))]">
              FA
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-foreground/55">
                Franco Alonso
              </p>
              <p className="mt-2 text-sm font-extrabold">IA · Producto</p>
            </div>
          </div>
          <div>
            <h2 className="max-w-3xl font-display text-5xl leading-[0.95] tracking-[-0.04em] md:text-7xl">
              IA, producto y ejecución en el mismo recorrido.
            </h2>
            <p className="mt-7 max-w-2xl text-base font-medium leading-8 text-foreground/65">
              Formación enfocada en tomar decisiones, construir flujos concretos y convertir cada concepto en una parte usable del producto.
            </p>
            <div className="mt-8">
              <WhatsAppButton />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">
              Cursos
            </p>
            <h2 className="mt-4 font-display text-5xl tracking-[-0.04em] md:text-7xl">
              Elegí qué construir.
            </h2>
          </div>
          <Link href="/cursos" className="inline-flex items-center gap-2 text-sm font-extrabold hover:text-accent">
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseTile
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                imageUrl={course.imageUrl}
                price={course.price}
                category={course.category?.name}
                chaptersLength={course.chapters.length}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-[32px] border border-dashed border-foreground/25 p-10 md:p-16">
            <p className="max-w-xl font-display text-4xl leading-tight">
              Los próximos cursos ya están tomando forma.
            </p>
            <p className="mt-4 text-muted-foreground">
              Escribime por WhatsApp para enterarte del primer lanzamiento.
            </p>
          </div>
        )}
      </section>

      <section id="preguntas" className="border-t border-foreground/10 bg-card">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">
              Antes de empezar
            </p>
            <h2 className="mt-4 font-display text-5xl leading-none md:text-7xl">
              Claro desde el principio.
            </h2>
          </div>
          <div className="space-y-4">
            {[
              "Comprás una vez y el curso queda asociado a tu cuenta.",
              "Tu avance se guarda automáticamente en cada lección.",
              "Podés ingresar desde computadora o celular.",
              "Las consultas comerciales van directo a WhatsApp.",
            ].map((item) => (
              <div key={item} className="flex gap-4 rounded-2xl border border-foreground/10 bg-background p-5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary">
                  <Check className="h-4 w-4" />
                </span>
                <p className="text-sm font-bold leading-7">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-foreground/10 px-5 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Franco Alonso.</p>
          <p>Cursos de IA para construir productos.</p>
        </div>
      </footer>
    </main>
  );
}

"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Ingresá un título",
  }),
});

const CreatePage = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: ""
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/courses", values);
      router.push(`/admin/cursos/${response.data.id}`);
      toast.success("Curso creado");
    } catch {
      toast.error("No pudimos crear el curso");
    }
  }

  return ( 
    <div className="mx-auto flex h-full max-w-5xl p-6 md:items-center md:justify-center">
      <div className="w-full max-w-xl rounded-[28px] border border-foreground/10 bg-card p-7 md:p-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent">Nuevo curso</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em]">
          Empezá por el nombre
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Usá un título claro. Podés cambiarlo antes de publicar.
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 mt-8"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Título del curso
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Ej.: Construí tu primer producto con IA"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Este nombre será visible en el catálogo y en el campus.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Link href="/admin/cursos">
                <Button
                  type="button"
                  variant="ghost"
                >
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
              >
                Continuar
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
   );
}
 
export default CreatePage;

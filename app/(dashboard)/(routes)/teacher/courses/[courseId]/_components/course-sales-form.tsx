"use client";

import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CourseSalesFormProps {
  courseId: string;
  initialData: {
    subtitle: string | null;
    level: string | null;
    estimatedMinutes: number | null;
    outcomes: string[];
    targetAudience: string[];
    notForAudience: string[];
    prerequisites: string[];
    projectTitle: string | null;
    projectDescription: string | null;
    projectImageUrl: string | null;
  };
}

const formSchema = z.object({
  subtitle: z.string().trim().max(280),
  level: z.string().trim().max(80),
  estimatedMinutes: z.string(),
  outcomes: z.string(),
  targetAudience: z.string(),
  notForAudience: z.string(),
  prerequisites: z.string(),
  projectTitle: z.string().trim().max(180),
  projectDescription: z.string().trim().max(1200),
  projectImageUrl: z.string(),
});

const toLines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

export const CourseSalesForm = ({
  courseId,
  initialData,
}: CourseSalesFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subtitle: initialData.subtitle || "",
      level: initialData.level || "",
      estimatedMinutes: initialData.estimatedMinutes?.toString() || "",
      outcomes: initialData.outcomes.join("\n"),
      targetAudience: initialData.targetAudience.join("\n"),
      notForAudience: initialData.notForAudience.join("\n"),
      prerequisites: initialData.prerequisites.join("\n"),
      projectTitle: initialData.projectTitle || "",
      projectDescription: initialData.projectDescription || "",
      projectImageUrl: initialData.projectImageUrl || "",
    },
  });

  const { isSubmitting } = form.formState;
  const hasContent = Boolean(
    initialData.subtitle ||
      initialData.level ||
      initialData.estimatedMinutes ||
      initialData.outcomes.length ||
      initialData.targetAudience.length ||
      initialData.projectTitle,
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const parsedMinutes = Number(values.estimatedMinutes);

      await axios.patch(`/api/courses/${courseId}`, {
        subtitle: values.subtitle || null,
        level: values.level || null,
        estimatedMinutes:
          values.estimatedMinutes && Number.isFinite(parsedMinutes)
            ? parsedMinutes
            : null,
        outcomes: toLines(values.outcomes),
        targetAudience: toLines(values.targetAudience),
        notForAudience: toLines(values.notForAudience),
        prerequisites: toLines(values.prerequisites),
        projectTitle: values.projectTitle || null,
        projectDescription: values.projectDescription || null,
        projectImageUrl: values.projectImageUrl || null,
      });

      toast.success("Presentación actualizada");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("No pudimos actualizar la presentación");
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-foreground/10 bg-card p-4">
      <div className="flex items-center justify-between font-medium">
        Presentación comercial
        <Button onClick={() => setIsEditing((current) => !current)} variant="ghost">
          {isEditing ? (
            "Cancelar"
          ) : (
            <>
              {hasContent ? (
                <Pencil className="mr-2 h-4 w-4" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              {hasContent ? "Editar" : "Completar"}
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl bg-muted p-3">
            <span className="text-xs text-muted-foreground">Resultado</span>
            <p className="mt-1 font-medium">
              {initialData.subtitle || "Sin definir"}
            </p>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <span className="text-xs text-muted-foreground">Nivel</span>
            <p className="mt-1 font-medium">{initialData.level || "Sin definir"}</p>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <span className="text-xs text-muted-foreground">Proyecto final</span>
            <p className="mt-1 font-medium">
              {initialData.projectTitle || "Sin definir"}
            </p>
          </div>
        </div>
      )}

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-6">
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resultado principal</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="Ej.: Construí y publicá un producto con IA listo para validar."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Una promesa concreta que complete el título del curso.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="Ej.: Inicial"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración estimada en minutos</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        inputMode="numeric"
                        min="1"
                        placeholder="Ej.: 360"
                        type="number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {[
              {
                name: "outcomes" as const,
                label: "Resultados del curso",
                placeholder: "Convertir una idea en un alcance ejecutable.\nPublicar una primera versión funcional.",
              },
              {
                name: "targetAudience" as const,
                label: "Este curso es para vos si...",
                placeholder: "Tenés una idea y querés convertirla en un producto real.",
              },
              {
                name: "notForAudience" as const,
                label: "No es para vos si...",
                placeholder: "Buscás contenido puramente teórico, sin trabajo práctico.",
              },
              {
                name: "prerequisites" as const,
                label: "Requisitos",
                placeholder: "Una computadora con acceso a internet.\nUna idea o problema que quieras trabajar.",
              },
            ].map((item) => (
              <FormField
                key={item.name}
                control={form.control}
                name={item.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{item.label}</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isSubmitting}
                        placeholder={item.placeholder}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Escribí un punto por línea.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <div className="rounded-2xl border border-foreground/10 p-4">
              <h3 className="font-bold">Proyecto final</h3>
              <div className="mt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="projectTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del proyecto</FormLabel>
                      <FormControl>
                        <Input disabled={isSubmitting} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="projectDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qué se lleva el alumno</FormLabel>
                      <FormControl>
                        <Textarea disabled={isSubmitting} rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="projectImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagen del resultado</FormLabel>
                      {field.value ? (
                        <div className="flex items-center justify-between gap-4 rounded-xl bg-muted p-3">
                          <span className="line-clamp-1 text-sm">Imagen cargada</span>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => field.onChange("")}
                          >
                            Cambiar
                          </Button>
                        </div>
                      ) : (
                        <FileUpload
                          endpoint="courseImage"
                          onChange={(url) => field.onChange(url || "")}
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button disabled={isSubmitting} type="submit">
              Guardar presentación
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

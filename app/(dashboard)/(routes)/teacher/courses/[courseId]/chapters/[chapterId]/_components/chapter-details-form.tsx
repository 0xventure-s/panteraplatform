"use client";

import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ChapterDetailsFormProps {
  courseId: string;
  chapterId: string;
  initialData: {
    moduleTitle: string | null;
    durationMinutes: number | null;
  };
}

const formSchema = z.object({
  moduleTitle: z.string().trim().max(120),
  durationMinutes: z.string(),
});

export const ChapterDetailsForm = ({
  courseId,
  chapterId,
  initialData,
}: ChapterDetailsFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moduleTitle: initialData.moduleTitle || "",
      durationMinutes: initialData.durationMinutes?.toString() || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        moduleTitle: values.moduleTitle || null,
        durationMinutes: values.durationMinutes ? Number(values.durationMinutes) : null,
      });
      toast.success("Detalles actualizados");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("No pudimos actualizar los detalles");
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-foreground/10 bg-card p-4">
      <div className="flex items-center justify-between font-medium">
        Módulo y duración
        <Button variant="ghost" onClick={() => setIsEditing((current) => !current)}>
          {isEditing ? "Cancelar" : <><Pencil className="mr-2 h-4 w-4" />Editar</>}
        </Button>
      </div>
      {!isEditing && (
        <p className="mt-2 text-sm">
          {initialData.moduleTitle || "Sin módulo"}
          {initialData.durationMinutes ? ` · ${initialData.durationMinutes} min` : ""}
        </p>
      )}
      {isEditing && (
        <Form {...form}>
          <form className="mt-4 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="moduleTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Módulo</FormLabel>
                  <FormControl><Input placeholder="Ej.: De la idea al alcance" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duración en minutos</FormLabel>
                  <FormControl><Input min="1" type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={form.formState.isSubmitting} type="submit">Guardar</Button>
          </form>
        </Form>
      )}
    </div>
  );
};

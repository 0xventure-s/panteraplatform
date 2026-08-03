"use client";

import * as z from "zod";
import axios from "axios";
import { Pencil, PlusCircle, ImageIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Course } from "@prisma/client";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";

interface ImageFormProps {
  initialData: Course
  courseId: string;
};

const formSchema = z.object({
  imageUrl: z.string().min(1, {
    message: "Agregá una imagen",
  }),
});

export const ImageForm = ({
  initialData,
  courseId
}: ImageFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success("Portada del tráiler actualizada");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("No pudimos actualizar la portada");
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-foreground/10 bg-card p-4">
      <div className="font-medium flex items-center justify-between">
        Portada del tráiler
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && (
            <>Cancelar</>
          )}
          {!isEditing && !initialData.imageUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Agregar imagen
            </>
          )}
          {!isEditing && initialData.imageUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Cambiar imagen
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        !initialData.imageUrl ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <ImageIcon className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <Image
              alt={`Portada de ${initialData.title}`}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover rounded-md"
              src={initialData.imageUrl}
            />
          </div>
        )
      )}
      {isEditing && (
        <div>
          <FileUpload
            endpoint="courseImage"
            onChange={(url) => {
              if (url) {
                onSubmit({ imageUrl: url });
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            Se muestra antes de reproducir el tráiler y al compartir el curso. Usá una imagen horizontal en proporción 16:9.
          </div>
        </div>
      )}
    </div>
  )
}

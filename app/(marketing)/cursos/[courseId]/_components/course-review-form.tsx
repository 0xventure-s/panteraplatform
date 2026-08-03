"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CourseReviewFormProps {
  courseId: string;
  initialReview?: {
    rating: number;
    comment: string;
  } | null;
}

export const CourseReviewForm = ({
  courseId,
  initialReview,
}: CourseReviewFormProps) => {
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [comment, setComment] = useState(initialReview?.comment || "");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const onSubmit = async () => {
    if (!rating || comment.trim().length < 12) {
      toast.error("Elegí una calificación y contá tu experiencia");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`/api/courses/${courseId}/reviews`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
      toast.success(initialReview ? "Opinión actualizada" : "Gracias por compartir tu experiencia");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "No pudimos guardar tu opinión",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-foreground/10 bg-card p-5 sm:p-6">
      <p className="font-bold">
        {initialReview ? "Tu opinión" : "¿Cómo fue tu experiencia?"}
      </p>
      <div className="mt-3 flex gap-1" aria-label="Calificación">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className="rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`}
            onClick={() => setRating(value)}
          >
            <Star
              className={cn(
                "h-6 w-6 text-foreground/25 transition",
                value <= rating && "fill-secondary text-foreground",
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        className="mt-4 min-h-28 bg-background"
        maxLength={1200}
        placeholder="Contá qué construiste, qué te resultó útil o qué debería saber alguien antes de empezar."
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      <Button className="mt-4 rounded-full" disabled={isSaving} onClick={onSubmit}>
        {initialReview ? "Actualizar opinión" : "Publicar opinión"}
      </Button>
    </div>
  );
};

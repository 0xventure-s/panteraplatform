"use client";

import axios from "axios";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FaqItem {
  question: string;
  answer: string;
}

interface CourseFaqsFormProps {
  courseId: string;
  initialItems: FaqItem[];
}

export const CourseFaqsForm = ({
  courseId,
  initialItems,
}: CourseFaqsFormProps) => {
  const [items, setItems] = useState<FaqItem[]>(initialItems);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const updateItem = (index: number, key: keyof FaqItem, value: string) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  };

  const onSubmit = async () => {
    const completeItems = items
      .map((item) => ({
        question: item.question.trim(),
        answer: item.answer.trim(),
      }))
      .filter((item) => item.question && item.answer);

    try {
      setIsSaving(true);
      await axios.put(`/api/courses/${courseId}/faqs`, { items: completeItems });
      setItems(completeItems);
      toast.success("Preguntas actualizadas");
      router.refresh();
    } catch {
      toast.error("No pudimos actualizar las preguntas");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-foreground/10 bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Preguntas frecuentes</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Respondé las dudas que aparecen antes de una inscripción.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setItems((current) => [...current, { question: "", answer: "" }])}
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar
        </Button>
      </div>

      <div className="mt-5 space-y-4">
        {items.length === 0 && (
          <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            Todavía no agregaste preguntas frecuentes.
          </p>
        )}
        {items.map((item, index) => (
          <div key={index} className="rounded-xl border border-foreground/10 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <Input
                  value={item.question}
                  placeholder="Pregunta"
                  onChange={(event) => updateItem(index, "question", event.target.value)}
                />
                <Textarea
                  value={item.answer}
                  placeholder="Respuesta"
                  rows={3}
                  onChange={(event) => updateItem(index, "answer", event.target.value)}
                />
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Eliminar pregunta"
                onClick={() =>
                  setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button className="mt-5" disabled={isSaving} onClick={onSubmit}>
        Guardar preguntas
      </Button>
    </div>
  );
};

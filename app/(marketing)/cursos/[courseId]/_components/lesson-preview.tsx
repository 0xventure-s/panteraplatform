"use client";

import { Play } from "lucide-react";
import dynamic from "next/dynamic";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
});

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LessonPreviewProps {
  playbackId: string;
  title: string;
}

export const LessonPreview = ({ playbackId, title }: LessonPreviewProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="h-8 rounded-full px-3 text-xs font-bold"
          size="sm"
          variant="secondary"
        >
          <Play className="mr-1.5 h-3 w-3 fill-current" />
          Vista previa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl overflow-hidden border-0 bg-[#15120f] p-0 text-white">
        <DialogHeader className="p-5 pb-0 text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-white/60">
            Lección abierta del curso.
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video bg-black">
          <MuxPlayer
            playbackId={playbackId}
            streamType="on-demand"
            title={title}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

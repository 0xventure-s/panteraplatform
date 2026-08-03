"use client";

import { Clapperboard } from "lucide-react";
import dynamic from "next/dynamic";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
});

interface CourseTrailerProps {
  playbackId?: string | null;
  posterUrl?: string | null;
  title: string;
}

export const CourseTrailer = ({
  playbackId,
  posterUrl,
  title,
}: CourseTrailerProps) => {
  if (!playbackId) {
    return (
      <div className="grid aspect-video place-items-center bg-[#181512] text-center text-white">
        <div className="max-w-xs px-8">
          <Clapperboard className="mx-auto h-9 w-9 text-secondary" />
          <p className="mt-4 font-display text-3xl leading-none">Tráiler en preparación</p>
          <p className="mt-3 text-sm leading-6 text-white/60">
            El adelanto del curso estará disponible antes de abrir las inscripciones.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video overflow-hidden bg-black">
      <MuxPlayer
        playbackId={playbackId}
        poster={posterUrl || undefined}
        streamType="on-demand"
        title={`Tráiler: ${title}`}
      />
    </div>
  );
};

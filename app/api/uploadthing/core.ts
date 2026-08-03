import { createUploadthing, type FileRouter } from "uploadthing/next";

import { getAdminUserId } from "@/lib/admin";
import { getCurrentUserId } from "@/lib/session";
 
const f = createUploadthing();
 
const handleAuth = async () => {
  const userId = await getAdminUserId();

  if (!userId) throw new Error("No autorizado");
  return { userId };
}

const handleProfileAuth = async () => {
  const userId = await getCurrentUserId();

  if (!userId) throw new Error("No autorizado");
  return { userId };
};

export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleProfileAuth())
    .onUploadComplete(() => {}),
  courseImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
  courseAttachment: f(["text", "image", "video", "audio", "pdf"])
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
  chapterVideo: f({ video: { maxFileCount: 1, maxFileSize: "512GB" } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {})
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;

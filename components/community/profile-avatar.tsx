import { cn } from "@/lib/utils";
import { resolveProfileAvatar } from "@/lib/profile-avatar";

interface ProfileAvatarProps {
  userId: string;
  name: string;
  image?: string | null;
  className?: string;
}

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "P";

export const ProfileAvatar = ({
  userId,
  name,
  image,
  className,
}: ProfileAvatarProps) => {
  const imageUrl = resolveProfileAvatar(userId, image);

  return (
    <div
      role="img"
      aria-label={`Foto de perfil de ${name}`}
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-[28%] border border-foreground/10 bg-secondary font-display font-bold text-foreground shadow-[0_12px_35px_rgba(30,24,20,0.12)]",
        className,
      )}
    >
      {getInitials(name)}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${JSON.stringify(imageUrl)})` }}
      />
    </div>
  );
};

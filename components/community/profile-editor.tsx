"use client";

import { GripVertical, Link2, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

import { ProfileAvatar } from "@/components/community/profile-avatar";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditableLink {
  id: string;
  label: string;
  url: string;
}

interface ProfileEditorProps {
  profile: {
    id: string;
    name: string;
    image: string | null;
    headline: string | null;
    bio: string | null;
    location: string | null;
    links: EditableLink[];
  };
}

export const ProfileEditor = ({ profile }: ProfileEditorProps) => {
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [image, setImage] = useState(profile.image ?? "");
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [links, setLinks] = useState<EditableLink[]>(profile.links);
  const [isSaving, setIsSaving] = useState(false);

  const addLink = () => {
    if (links.length >= 8) {
      return;
    }

    setLinks((current) => [
      ...current,
      { id: `new-${Date.now()}`, label: "", url: "" },
    ]);
  };

  const updateLink = (id: string, field: "label" | "url", value: string) => {
    setLinks((current) =>
      current.map((link) =>
        link.id === id ? { ...link, [field]: value } : link,
      ),
    );
  };

  const removeLink = (id: string) => {
    setLinks((current) => current.filter((link) => link.id !== id));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image, headline, bio, location, links }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "No pudimos guardar los cambios.");
      }

      toast.success("Perfil actualizado");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos guardar los cambios.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <div className="grid gap-6 rounded-[24px] border border-foreground/10 bg-background p-5 sm:grid-cols-[112px_1fr] sm:items-center">
        <ProfileAvatar
          userId={profile.id}
          name={name || profile.name}
          image={image}
          className="h-28 w-28 text-2xl"
        />
        <div className="min-w-0">
          <Label>Foto de perfil</Label>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            También aparece en el ranking y en los cursos que dictás.
          </p>
          <div className="mt-4">
            <FileUpload
              endpoint="profileImage"
              onChange={(url) => setImage(url ?? "")}
            />
          </div>
          {image && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setImage("")}
              className="mt-2 rounded-full px-3 text-muted-foreground"
            >
              Quitar foto
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="profile-name">Nombre público</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            required
            className="h-12 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-location">Ubicación</Label>
          <Input
            id="profile-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            maxLength={80}
            placeholder="Ciudad, país"
            className="h-12 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-headline">Presentación</Label>
        <Input
          id="profile-headline"
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
          maxLength={120}
          placeholder="Qué estás construyendo o aprendiendo"
          className="h-12 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="profile-bio">Sobre vos</Label>
          <span className="text-xs text-muted-foreground">{bio.length}/600</span>
        </div>
        <Textarea
          id="profile-bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={600}
          rows={5}
          placeholder="Contá en qué trabajás, qué te interesa y qué querés crear."
          className="min-h-32 resize-y rounded-xl"
        />
      </div>

      <div className="space-y-4 border-t border-foreground/10 pt-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold">Proyectos y enlaces</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Repositorios, portfolio, LinkedIn o proyectos publicados.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addLink}
            disabled={links.length >= 8}
            className="rounded-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar enlace
          </Button>
        </div>

        {links.length > 0 ? (
          <div className="space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="grid gap-3 rounded-2xl border border-foreground/10 bg-background p-3 sm:grid-cols-[auto_0.65fr_1fr_auto] sm:items-center"
              >
                <GripVertical className="hidden h-4 w-4 text-muted-foreground sm:block" />
                <Input
                  value={link.label}
                  onChange={(event) =>
                    updateLink(link.id, "label", event.target.value)
                  }
                  maxLength={40}
                  placeholder="GitHub"
                  aria-label="Nombre del enlace"
                  required
                  className="rounded-xl"
                />
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="url"
                    value={link.url}
                    onChange={(event) =>
                      updateLink(link.id, "url", event.target.value)
                    }
                    placeholder="https://github.com/usuario/proyecto"
                    aria-label="Dirección del enlace"
                    required
                    className="rounded-xl pl-9"
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeLink(link.id)}
                  aria-label={`Eliminar ${link.label || "enlace"}`}
                  className="rounded-full text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-foreground/20 p-6 text-center text-sm text-muted-foreground">
            Sumá tu primer proyecto para que la comunidad pueda conocer tu trabajo.
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="h-12 rounded-full bg-foreground px-7 text-background"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar perfil
        </Button>
      </div>
    </form>
  );
};

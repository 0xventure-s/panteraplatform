import { notFound, redirect } from "next/navigation";

import { ProfileView } from "@/components/community/profile-view";
import { getCommunityProfile, getLeaderboard } from "@/lib/community";
import { getCurrentUserId } from "@/lib/session";

export default async function CommunityProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const currentUserId = await getCurrentUserId();

  if (!currentUserId) {
    redirect("/sign-in");
  }

  const { userId } = await params;

  if (userId === currentUserId) {
    redirect("/perfil");
  }

  const [profile, leaderboard] = await Promise.all([
    getCommunityProfile(userId),
    getLeaderboard(),
  ]);

  if (!profile) {
    notFound();
  }

  const rank = leaderboard.find((entry) => entry.id === userId)?.position;

  return <ProfileView profile={profile} canEdit={false} rank={rank} />;
}

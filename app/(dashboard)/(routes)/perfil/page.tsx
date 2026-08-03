import { redirect } from "next/navigation";

import { ProfileView } from "@/components/community/profile-view";
import { getCommunityProfile, getLeaderboard } from "@/lib/community";
import { getCurrentUserId } from "@/lib/session";

export default async function MyProfilePage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/sign-in");
  }

  const [profile, leaderboard] = await Promise.all([
    getCommunityProfile(userId),
    getLeaderboard(),
  ]);

  if (!profile) {
    redirect("/dashboard");
  }

  const rank = leaderboard.find((entry) => entry.id === userId)?.position;

  return <ProfileView profile={profile} canEdit rank={rank} />;
}

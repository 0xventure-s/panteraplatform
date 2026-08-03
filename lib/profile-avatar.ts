export const ROBOT_AVATAR_COUNT = 50;

const hashSeed = (seed: string) => {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

export const getRobotAvatarPath = (seed: string) => {
  const robotNumber = (hashSeed(seed) % ROBOT_AVATAR_COUNT) + 1;

  return `/robot-avatars/robot-${String(robotNumber).padStart(2, "0")}.jpg`;
};

const isSafeProfileImage = (image: string) =>
  image.startsWith("/") || image.startsWith("https://");

export const resolveProfileAvatar = (
  seed: string,
  image?: string | null,
) => {
  const normalizedImage = image?.trim();

  return normalizedImage && isSafeProfileImage(normalizedImage)
    ? normalizedImage
    : getRobotAvatarPath(seed);
};

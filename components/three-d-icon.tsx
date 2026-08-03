import Image from "next/image";

import { cn } from "@/lib/utils";

const iconPaths = {
  bulb: "/thiings/artificial-intelligence.png",
  chart: "/thiings/charts.png",
  clock: "/thiings/timer.png",
  computer: "/thiings/computer.png",
  "credit-card": "/thiings/credit-card.png",
  cube: "/thiings/parcel.png",
  link: "/thiings/workflow.png",
  notebook: "/thiings/book.png",
  profile: "/thiings/profile.png",
  rocket: "/thiings/parcel.png",
  robot: "/thiings/robot.png",
  setting: "/thiings/gear.png",
  target: "/thiings/robot.png",
  tick: "/thiings/checkmark.png",
  wallet: "/thiings/wallet.png",
  zoom: "/thiings/search.png",
} as const;

export type ThreeDIconName = keyof typeof iconPaths;

interface ThreeDIconProps {
  name: ThreeDIconName;
  size?: number;
  className?: string;
}

export const ThreeDIcon = ({
  name,
  size = 32,
  className,
}: ThreeDIconProps) => {
  return (
    <Image
      src={iconPaths[name]}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      unoptimized
      draggable={false}
      className={cn("shrink-0 select-none object-contain", className)}
    />
  );
};

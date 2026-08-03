import { SiteLogo } from "@/components/site-logo";

export const Logo = ({ href = "/dashboard" }: { href?: string }) => {
  return <SiteLogo href={href} />;
};

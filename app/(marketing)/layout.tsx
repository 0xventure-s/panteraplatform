import { Navbar } from "@/app/(dashboard)/_components/navbar";
import { Sidebar } from "@/app/(dashboard)/_components/sidebar";
import { SiteLogo } from "@/components/site-logo";
import { WhatsAppButton } from "@/components/whatsapp-button";

import { MarketingFrame } from "./_components/marketing-frame";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingFrame
      brand={<SiteLogo href="/cursos" />}
      navbar={<Navbar />}
      sidebar={<Sidebar />}
      floatingAction={
        <WhatsAppButton compact className="fixed bottom-5 right-5 z-40 sm:hidden" />
      }
    >
      {children}
    </MarketingFrame>
  );
}

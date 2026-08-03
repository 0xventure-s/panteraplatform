import { MarketingHeader } from "@/components/marketing/marketing-header";
import { WhatsAppButton } from "@/components/whatsapp-button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-background">
      <MarketingHeader />
      {children}
      <WhatsAppButton compact className="fixed bottom-5 right-5 z-40 sm:hidden" />
    </div>
  );
}

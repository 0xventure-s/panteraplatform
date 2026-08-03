import "./globals.css";
import type { Metadata } from "next";
import { DM_Serif_Display, Manrope } from "next/font/google";

import { ConfettiProvider } from "@/components/providers/confetti-provider";
import { ToastProvider } from "@/components/providers/toaster-provider";
import { siteConfig } from "@/lib/site-config";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: `${siteConfig.name} | Cursos de IA para construir productos`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.shortDescription,
    siteName: siteConfig.name,
    type: "website",
    locale: "es_AR",
    images: [
      {
        url: siteConfig.logo,
        width: 1254,
        height: 1254,
        alt: "Kiwi Academia",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: siteConfig.name,
    description: siteConfig.shortDescription,
    images: [siteConfig.logo],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${manrope.variable} ${display.variable} font-sans`}>
        <ConfettiProvider />
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}

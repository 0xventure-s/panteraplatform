import './globals.css'
import type { Metadata } from 'next'
import { DM_Serif_Display, Manrope } from 'next/font/google'
import { ToastProvider } from '@/components/providers/toaster-provider'
import { ConfettiProvider } from '@/components/providers/confetti-provider'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
})

const display = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://francoalonso.com'),
  title: {
    default: 'Franco Alonso | Cursos de IA para construir productos',
    template: '%s | Franco Alonso',
  },
  description: 'Cursos de IA orientados a construir, validar y lanzar productos reales.',
  openGraph: {
    title: 'Franco Alonso',
    description: 'Cursos de IA para construir productos.',
    type: 'website',
    locale: 'es_AR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
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

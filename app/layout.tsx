import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Zolve Home Base — H-1B Sponsored Jobs for International Professionals',
    template: '%s | Zolve Home Base',
  },
  description:
    'Find software engineering jobs at companies that actively sponsor H-1B visas. Government-verified sponsorship data for international professionals.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://homebase.zolve.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Zolve Home Base',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}

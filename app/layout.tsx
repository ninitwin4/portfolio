import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Poppins } from 'next/font/google'
import './globals.css'
import { Footer } from './footer'
import { ThemeProvider } from 'next-themes'
import { HERO } from './data'
import { WEBSITE_URL } from '@/lib/constants'
import { Container } from '@/components/container'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0d12',
}

const siteTitle = `${HERO.name} — ${HERO.title}`

export const metadata: Metadata = {
  metadataBase: new URL(WEBSITE_URL),
  alternates: {
    canonical: '/',
  },
  title: {
    default: siteTitle,
    template: `%s | ${HERO.name}`,
  },
  description: HERO.tagline,
  openGraph: {
    title: siteTitle,
    description: HERO.tagline,
    url: WEBSITE_URL,
    siteName: HERO.name,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: siteTitle,
    description: HERO.tagline,
  },
  icons: {
    icon: [{ url: '/icon', type: 'image/png', sizes: '32x32' }],
    apple: [{ url: '/apple-icon', type: 'image/png', sizes: '180x180' }],
  },
}

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Display face for the hero name only - body copy stays Geist.
const displayFont = Poppins({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '700',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} ${displayFont.variable} font-sans tracking-tight antialiased`}
      >
        <ThemeProvider
          enableSystem={true}
          attribute="class"
          storageKey="theme"
          defaultTheme="dark"
        >
          <div className="flex min-h-screen w-full flex-col">
            {/* No width cap here - pages own their own Container so the hero
                can run full-bleed. */}
            <div className="relative w-full flex-1">{children}</div>
            <Container>
              <Footer />
            </Container>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

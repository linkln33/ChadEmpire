import type { Metadata, Viewport } from 'next'
import { Inter, Orbitron, Share_Tech_Mono } from 'next/font/google'
import './globals.css'
import '@/styles/wallet-override.css'
import { WalletProvider } from '@/components/wallet/WalletProvider'
import Navigation from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import GlobalBackground from '@/components/effects/GlobalBackground'
import MusicPlayer from '@/components/music/MusicPlayer'

const inter = Inter({ subsets: ['latin'] })

// Load Orbitron font - a futuristic Google font
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
  display: 'swap',
})

// Load Share Tech Mono font - perfect for typewriter effect
const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-share-tech-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ChadEmpire - Spin like a Chad, Win like a Legend',
  description: 'The Ultimate MemeFi Yield Game on Solana',
  applicationName: 'ChadEmpire',
  authors: [{ name: 'ChadEmpire Team' }],
  keywords: ['Solana', 'DeFi', 'Blockchain', 'GameFi', 'Yield', 'Staking'],
  openGraph: {
    title: 'ChadEmpire - Spin like a Chad, Win like a Legend',
    description: 'The Ultimate MemeFi Yield Game on Solana',
    url: 'https://chadempire.io',
    siteName: 'ChadEmpire',
    images: [
      {
        url: '/images/chad-warrior.svg',
        width: 1200,
        height: 630,
        alt: 'ChadEmpire',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChadEmpire - Spin like a Chad, Win like a Legend',
    description: 'The Ultimate MemeFi Yield Game on Solana',
    images: ['/images/chad-warrior.svg'],
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${shareTechMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script src="/scripts/sticky-player.js" defer></script>
      </head>
      <body className={`${inter.className} text-white min-h-screen flex flex-col`}>
        <GlobalBackground />
        <WalletProvider>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </WalletProvider>
      </body>
    </html>
  )
}

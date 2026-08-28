import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import { ClientProviders } from '@/components/layout/ClientProviders';

export const metadata: Metadata = {
  title: 'Loops of Love | Handmade Crochet Flowers, Plushies & Custom Gifts India',
  description: 'Loops of Love (@loopsoflove_co) offers handcrafted crochet flower bouquets, keychains, amigurumi plushies, bags, and custom gifts made with love in India.',
  keywords: 'crochet flowers, handmade bouquet, amigurumi toys, crochet keychains, custom crochet gifts, India',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAF4E8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#FAF4E8] text-[#1A1A1A] antialiased min-h-screen flex flex-col selection:bg-[#C86D51] selection:text-white">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

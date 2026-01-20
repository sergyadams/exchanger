import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/Toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Exchanger - Мгновенный Криптообменник',
  description: 'Мгновенный обмен криптовалют',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}

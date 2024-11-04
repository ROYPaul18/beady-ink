// app/layout.tsx

import type { Metadata } from 'next';
import { Cinzel } from 'next/font/google';

import './globals.css';
import Header from './ui/header';
import Footer from './ui/footer';
import { Providers } from './providers';
import { ReservationProvider } from '@/app/context/ReservationContext';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700'], // Ajustez les poids selon vos besoins
  display: 'swap', // Utilisez 'swap' pour améliorer le chargement de la police
});

export const metadata: Metadata = {
  metadataBase: new URL('https://beaudy-ink.com'),
  keywords: [
    'Beaudy Ink',
    'salon de tatouage et d’onglerie Soye-en-Septaine',
    'salon de tatouage et d’onglerie Flavigny',
    'nail art Soye-en-Septaine',
    'tatouage professionnel Flavigny',
    'extensions d’ongles Flavigny',
    'tatouage artistique Soye-en-Septaine',
    'manucure tendance Flavigny',
    'ongles en gel Soye-en-Septaine',
    'tatouage personnalisé Soye-en-Septaine',
    'tatouage floral Flavigny',
  ],
  title: {
    default: 'Beaudy Ink - Onglerie et Tatouage à Soye-en-Septaine et Flavigny',
    template: 'Beaudy Ink - %s',
  },
  description:
  "Découvrez Beaudy Ink, un salon professionnel de tatouage et d'onglerie à Soye-en-Septaine et Flavigny, offrant des designs uniques et artistiques pour sublimer votre style.",
  openGraph: {
    description:
      "Salon d'onglerie et tatouage Beaudy Ink à Soye-en-Septaine et Flavigny. Designs uniques et professionnels pour vos ongles et tatouages.",
    images: [''], // Ajoutez l'URL de votre image Open Graph ici si disponible
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${cinzel.className} antialiased`}>
        <Providers>
          <ReservationProvider>
            <Header />
            {children}
            <Footer />
          </ReservationProvider>
        </Providers>
      </body>
    </html>
  );
}

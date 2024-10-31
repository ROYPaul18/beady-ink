import type { Metadata } from "next";

import "./globals.css";
import Header from "./ui/header";
import Footer from "./ui/footer";
import { Providers } from "./providers";
import { ReservationProvider } from '@/app/context/ReservationContext';


export const metadata: Metadata = {
  metadataBase: new URL("https://beaudy-ink.com"),
  keywords: [
    "Beaudy Ink", "salon de tatouage et d’onglerie Soye-en-Septaine", "salon de tatouage et d’onglerie Flavigny", 
    "nail art Soye-en-Septaine", "tatouage professionnel Flavigny", "extensions d’ongles Flavigny", 
    "tatouage artistique Soye-en-Septaine", "manucure tendance Flavigny", "ongles en gel Soye-en-Septaine", 
    "tatouage personnalisé Soye-en-Septaine", "tatouage floral Flavigny"
  ],
  title: {
    default: "Beaudy Ink - Onglerie et Tatouage à Soye-en-Septaine et Flavigny",
    template: "Beaudy Ink - Onglerie et Tatouage à Soye-en-Septaine et Flavigny"
  },
  openGraph: {
    description: "Salon d'onglerie et tatouage Beaudy Ink à Soye-en-Septaine et Flavigny. Designs uniques et professionnels pour vos ongles et tatouages.",
    images: [""]
  }
  ,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-cinzel antialiased" suppressHydrationWarning={true}>
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

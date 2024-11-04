export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import FlashTattooGallery from '../ui/tattoo/FlashTattooGallery';
import { Prestation } from '@/lib/types';
import Image from 'next/image';

// Function to fetch flash tattoo prestations
async function getFlashTattoos(): Promise<Prestation[]> {
  return db.prestation.findMany({
    where: {
      service: {
        type: 'FLASH_TATTOO',
      },
    },
    include: {
      images: true,
      service: true,
    },
  });
}

// Composant pour la page des flash tattoos
export default async function FlashTattooPage() {
  const flashTattoos = await getFlashTattoos();

  return (
    <div className="relative min-h-screen px-8 py-2 md:px-26 lg:px-60">
      {/* Image de fond optimisée */}
      <Image
        src="/img/13.png"
        alt="Fond Flash Tattoo"
        fill
        style={{ objectFit: "cover", zIndex: -1 }}
        priority
      />

      <h1 className="text-white text-center text-4xl md:text-6xl mb-2">
        Galerie de Flash Tattoo
      </h1>
      <div className="flex justify-end">
        <a
          href="/reservation/flashtattoo"
          className="bg-marron text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
        >
          Se Faire Tatouer
        </a>
      </div>

      <FlashTattooGallery prestations={flashTattoos} />
    </div>
  );
}

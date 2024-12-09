export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import FlashTattooGalleryReser from '../../ui/reservation/FlashTattooGalleryReser';
import { Prestation } from '@/lib/types';

export default async function FlashTattooReservation() {
  let prestations: Prestation[] = [];

  try {
    prestations = await db.prestation.findMany({
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
  } catch (error) {
    console.error("Erreur lors de la récupération des prestations:", error);
  }

  return (
    <div className="bg-[url('/img/13.png')] min-h-screen bg-cover px-4 py-10">
      <h1 className="text-center text-white text-4xl md:text-5xl font-bold mb-2">
        Choisissez votre Flash Tattoo
      </h1>
      <FlashTattooGalleryReser prestations={prestations} />
    </div>
  );
}
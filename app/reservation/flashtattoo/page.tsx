// app/reservation/flashtattoo/page.tsx
import { db } from '@/lib/db';
import FlashTattooGallery from '../../ui/tattoo/FlashTattooGallery';
import { Prestation } from '@/lib/types';

async function getFlashTattoos(): Promise<Prestation[]> {
  try {
    return await db.prestation.findMany({
      where: {
        service: {
          type: 'FLASH_TATTOO',
        },
      },
      include: {
        images: true,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des prestations:", error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
}

export default async function FlashTattooReservation() {
  const prestations = await getFlashTattoos();

  return (
    <div className="bg-[url('/img/13.png')] min-h-screen bg-cover px-4 py-10">
      <h1 className="text-center text-white text-4xl md:text-5xl font-bold mb-10">
        Choisissez votre Flash Tattoo
      </h1>
      <FlashTattooGallery prestations={prestations} />
    </div>
  );
}

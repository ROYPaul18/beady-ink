import { db } from '@/lib/db';
import FlashTattooGallery from '../ui/tattoo/FlashTattooGallery';
import { Prestation } from '@/lib/types';

// Fonction pour récupérer les prestations de flash tattoos
async function getFlashTattoos(): Promise<Prestation[]> {
  return db.prestation.findMany({
    where: {
      service: {
        type: 'FLASH_TATTOO',
      },
    },
    include: {
      images: true,
    },
  });
}

// Composant pour la page des flash tattoos
export default async function FlashTattooPage() {
  const flashTattoos = await getFlashTattoos();

  return (
    <div className="bg-[url('/img/13.png')] min-h-screen bg-cover px-8 py-2 md:px-26 lg:px-60">
      <h1 className="text-white text-center text-4xl md:text-6xl mb-10">
        Galerie de Flash Tattoos
      </h1>
      <div className="flex justify-end mb-6">
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

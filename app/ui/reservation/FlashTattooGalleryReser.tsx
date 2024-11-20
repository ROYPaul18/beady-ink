'use client';

import { useState } from 'react';
import { Prestation } from '@/lib/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface FlashTattooGalleryProps {
  prestations: Prestation[]; // On s'attend à ce que prestations soit un tableau de Prestation
}

const FlashTattooGallery: React.FC<FlashTattooGalleryProps> = ({ prestations }) => {
  const [selectedTattoo, setSelectedTattoo] = useState<Prestation | null>(null);
  const router = useRouter();

  const handleSelect = (prestation: Prestation) => {
    setSelectedTattoo(prestation);

    // Sauvegarder les informations du flash tattoo sélectionné dans localStorage
    localStorage.setItem('flashTattooData', JSON.stringify({
      flashTattooId: prestation.id,
      name: prestation.name,
      price: prestation.price,
      images: prestation.images,
    }));
  };

  // Vérifie que les prestations existent et ont des éléments
  if (!prestations || prestations.length === 0) {
    return <div className="text-center text-gray-500">Aucun flash tattoo disponible.</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6 justify-center">
      {prestations.map((prestation) => (
        <div
          key={prestation.id}
          className="shadow-md overflow-hidden cursor-pointer"
          onClick={() => handleSelect(prestation)}
        >
          <div className="relative w-full h-0 pb-[100%]">
            <Image
              src={prestation.images[0]?.url || '/placeholder.png'}
              alt={prestation.name}
              className="absolute inset-0 rounded-lg object-cover w-full h-full"
              layout="fill"
            />
          </div>
          <div className="p-4 text-center bg-black bg-opacity-60">
            <h3 className="text-lg font-bold mb-1 text-white">{prestation.name}</h3>
            <p className="text-white font-semibold">À partir de {prestation.price} €</p>
          </div>
        </div>
      ))}
      {selectedTattoo && (
        <div className="mt-6 text-center text-white">
          <h2 className="text-2xl font-semibold mb-4">Vous avez sélectionné :</h2>
          <p>{selectedTattoo.name}</p>
          <button
            onClick={() => router.push('/reservation/flashtattoo/questionnaire-sante')}
            className="mt-4 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600"
          >
            Confirmer et passer à l'étape suivante
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashTattooGallery;

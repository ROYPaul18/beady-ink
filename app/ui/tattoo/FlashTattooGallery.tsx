// app/ui/flashtattoo/FlashTattooGallery.tsx
'use client';

import { useState } from 'react';
import { Prestation } from '@/lib/types'; // Assurez-vous que ce type est bien défini dans votre projet
import Image from 'next/image';
interface FlashTattooGalleryProps {
  prestations: Prestation[];
}

const FlashTattooGallery: React.FC<FlashTattooGalleryProps> = ({ prestations }) => {
  const [selectedTattoo, setSelectedTattoo] = useState<Prestation | null>(null);

  const handleSelect = (prestation: Prestation) => {
    setSelectedTattoo(prestation);
    // Vous pouvez rediriger ou enregistrer cette sélection pour la suite de la réservation
    // Par exemple, stocker dans un état global ou rediriger vers une autre page
  };

  if (!prestations.length) {
    return <div className="text-center text-gray-500">Aucun flash tattoo disponible.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {prestations.map((prestation) => (
        <div
          key={prestation.id}
          className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer"
          onClick={() => handleSelect(prestation)}
        >
          <Image
            src={prestation.images[0]?.url}
            alt={prestation.name}
            className="w-full h-64 object-cover"
            height={300}
            width={300}
          />
          <div className="p-4">
            <h3 className="text-lg font-bold">{prestation.name}</h3>
            <p className="text-gray-600">Prix: {prestation.price} €</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlashTattooGallery;

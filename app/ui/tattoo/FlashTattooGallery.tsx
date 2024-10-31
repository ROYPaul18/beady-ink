'use client';

import { useState } from 'react';
import { Prestation } from '@/lib/types';
import Image from 'next/image';

interface FlashTattooGalleryProps {
  prestations: Prestation[];
}

const FlashTattooGallery: React.FC<FlashTattooGalleryProps> = ({ prestations }) => {
  const [selectedTattoo, setSelectedTattoo] = useState<Prestation | null>(null);

  const handleSelect = (prestation: Prestation) => {
    setSelectedTattoo(prestation);
  };

  if (!prestations.length) {
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
              className="absolute inset-0 object-cover w-full h-full"
              layout="fill"
            />
          </div>
          <div className="p-4 text-center bg-black bg-opacity-60">
            <h3 className="text-lg font-bold mb-1 text-white">{prestation.name}</h3>
            <p className="text-white font-semibold">À partir de {prestation.price} €</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlashTattooGallery;

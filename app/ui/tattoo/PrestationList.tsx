'use client';

import { Prestation } from '@/lib/types';
import Image from 'next/image';

interface PrestationListProps {
  prestations: Prestation[];
}

const PrestationList: React.FC<PrestationListProps> = ({ prestations }) => {
  if (!prestations.length) {
    return <div className="text-white text-center">Aucune image de flash tattoo trouvée.</div>;
  }

  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
      {prestations.map((prestation) => (
        <div key={prestation.id} className="mb-4 break-inside-avoid">
          {prestation.images.length > 0 && (
            <div className="relative w-full h-auto aspect-auto rounded-lg overflow-hidden shadow-lg">
              <Image
                src={prestation.images[0].url}
                alt={`Flash Tattoo - ${prestation.name}`}
                width={600}
                height={800}
                className="object-cover w-full h-full"
                style={{ height: `${200 + Math.random() * 200}px` }} // Hauteurs variables pour effet de galerie
              />
            </div>
          )}
          <div className="text-center mt-2 text-lg font-medium text-white">
            {prestation.price} €
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrestationList;

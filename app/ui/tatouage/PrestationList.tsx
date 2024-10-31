'use client';

import { Prestation } from '@/lib/types';
import Image from 'next/image';

interface PrestationListProps {
  prestations: Prestation[];
}

const PrestationList: React.FC<PrestationListProps> = ({ prestations }) => {
  if (!prestations.length) {
    return <div className="text-white text-center">Aucune image de tatouage trouvée.</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 md:gap-6 md:p-6">
      {prestations.map((prestation) => (
        <div 
          key={prestation.id} 
          className="shadow-lg overflow-hidden cursor-pointer"
        >
          {prestation.images.length > 0 && (
            <div className="relative w-full h-0 pb-[100%]">
              <Image
                src={prestation.images[0].url}
                alt={`Tatouage - ${prestation.name}`}
                layout="fill"
                className="absolute inset-0 object-cover w-full h-full"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PrestationList;

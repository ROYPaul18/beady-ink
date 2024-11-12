'use client';

import { useReservation } from '@/app/context/ReservationContext';
import { PrestationWithImages } from '@/lib/types';
import Image from 'next/image';

interface ReservationPrestationListProps {
  prestations: PrestationWithImages[];
  isAuthenticated: boolean;
}

const ReservationPrestationList: React.FC<ReservationPrestationListProps> = ({
  prestations,
  isAuthenticated,
}) => {
  const { prestationsComplementaires, setPrestationsComplementaires } = useReservation();

  const handleSelectPrestation = (prestation: PrestationWithImages) => {
    const isAlreadySelected = prestationsComplementaires.some(
      (p) => p.id === prestation.id
    );

    if (!isAlreadySelected) {
      setPrestationsComplementaires([...prestationsComplementaires, prestation]);
    }
  };

  if (!prestations.length) {
    return (
      <div className="text-center text-gray-500">
        Aucune prestation d'onglerie trouvée
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {prestations.map((prestation) => (
        <div key={prestation.id} className="flex flex-col bg-white shadow-md rounded-md p-3 md:p-4">
          <div className="w-full flex flex-col">
            <h3 className="text-xl font-bold text-green mb-2">
              {prestation.name}
            </h3>
            <div className="w-full relative min-h-[150px] md:min-h-[180px] mb-2">
              {prestation.images[0] && (
                <Image
                  src={prestation.images[0].url}
                  alt={`Image de ${prestation.name}`}
                  fill
                  className="object-cover rounded-md"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}
            </div>
            <div className="text-sm text-gray-700 mb-2">
              {prestation.description}
            </div>
            <div className="flex justify-between items-center text-lg text-green mb-2">
              <span>Durée : {prestation.duration} min</span>
              <span>Prix : {prestation.price} €</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSelectPrestation(prestation)}
                className="mt-2 border border-green text-green px-3 py-1 rounded-md hover:bg-green hover:text-white transition duration-200"
              >
                Ajouter la prestation
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReservationPrestationList;

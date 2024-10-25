// app/ui/onglerie/PrestationList.tsx
'use client';

import { useRouter } from 'next/navigation';
import { PrestationWithImages } from '@/lib/types';
import Image from 'next/image';

interface PrestationListProps {
  prestations: PrestationWithImages[];
  isAuthenticated: boolean;
}

const PrestationList: React.FC<PrestationListProps> = ({ prestations, isAuthenticated }) => {
  const router = useRouter();

  const handleReservationClick = (id: number) => {
    if (isAuthenticated) {
      router.push(`/reservation/onglerie/calendar?id=${id}`);
    } else {
      router.push('/sign-up');
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
    <div className="  ">
      {prestations.map((prestation) => (
        <div
          key={prestation.id}
          className="flex flex-col bg-white  md:flex-row md:h-[520px]"
        >
          {/* Contenu à gauche pour mobile et desktop */}
          <div className="w-full p-4 flex flex-col justify-between md:w-1/2 md:p-6">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-green mb-2 md:mb-4">
                {prestation.name}
              </h3>

              {/* Image apparaît après le titre sur mobile */}
              <div className="w-full relative min-h-[300px] md:hidden mb-4">
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

              <p className="text-gray-700 text-xl mb-4">{prestation.description}</p>
              <div className="text-2xl text-green flex justify-between mb-4">
                <span>Durée : {prestation.duration} min</span>
                <span>Prix : {prestation.price} €</span>
              </div>
            </div>
            <button
              onClick={() => handleReservationClick(prestation.id)}
              className="mt-4 border border-green text-green px-3 py-1 rounded-md text-lg hover:bg-green hover:text-white transition duration-200"
            >
              RÉSERVER CETTE PRESTATION
            </button>
          </div>

          {/* Image à droite pour les écrans plus grands */}
          <div className="hidden md:block w-full md:w-1/2 relative min-h-[400px]">
            {prestation.images[0] && (
              <Image
                src={prestation.images[0].url}
                alt={`Image de ${prestation.name}`}
                fill
                className="object-cover "
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrestationList;

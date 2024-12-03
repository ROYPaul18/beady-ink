'use client';

import { useRouter } from "next/navigation";
import { PrestationWithImages } from "@/lib/types";
import Image from "next/image";

interface PrestationListProps {
  prestations: PrestationWithImages[];
  isAuthenticated: boolean;
}

const PrestationList: React.FC<PrestationListProps> = ({
  prestations,
  isAuthenticated,
}) => {
  const router = useRouter();

  const handleReservationClick = (id: number) => {
    if (isAuthenticated) {
      router.push(`/reservation/onglerie/calendar?id=${id}`);
    } else {
      router.push("/sign-up");
    }
  };

  const prestationsByCategory = prestations.reduce((acc, prestation) => {
    const category = prestation.category || "Autres";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(prestation);
    return acc;
  }, {} as Record<string, PrestationWithImages[]>);

  if (!prestations.length) {
    return (
      <div className="text-center text-gray-500 px-4">
        Aucune prestation d'onglerie trouvée
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-56  ">
      {Object.entries(prestationsByCategory).map(([category, prestations]) => (
        <div key={category}>
          {prestations.map((prestation) => (
            <div
              key={prestation.id}
              className="bg-white shadow-lg  overflow-hidden"
            >
              {/* Image en haut pour mobile */}
              <div className="w-full relative h-[200px] sm:h-[300px] md:hidden">
                {prestation.images[0] && (
                  <Image
                    src={prestation.images[0].url}
                    alt={`Image de ${prestation.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw"
                    priority
                  />
                )}
              </div>

              <div className="flex flex-col md:flex-row md:h-[520px]">
                {/* Contenu */}
                <div className="w-full p-4 sm:p-6 flex flex-col justify-between md:w-1/2">
                  <div>
                    <h3 className="text-4xl sm:text-3xl md:text-4xl font-bold text-green sm:mb-4">
                      {prestation.name}
                    </h3>
                    <h4 className="text-xl sm:text-3xl md:text-lg font-bold text-green sm:mb-4">
                      {prestation.category}
                    </h4>

                    <p className="text-gray-700 text-sm sm:text-base">
                      {prestation.description}
                    </p>
                  </div>

                  <div className="mt-2 pt-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-xl sm:text-2xl text-green">
                      <span className="text-sm sm:text-base">
                        Durée : {prestation.duration} min
                      </span>
                      <span className="text-sm sm:text-base">
                        Prix : {prestation.price} €
                      </span>
                    </div>
                    <button
                      onClick={() => handleReservationClick(prestation.id)}
                      className="w-full sm:w-auto border border-green text-green px-3 py-2 rounded-sm text-base sm:text-lg hover:bg-green hover:text-white transition duration-200 mt-4 flex justify-center"
                    >
                      RÉSERVER CETTE PRESTATION
                    </button>
                  </div>
                </div>

                {/* Image à droite pour desktop */}
                <div className="hidden md:block w-full md:w-1/2 relative">
                  {prestation.images[0] && (
                    <Image
                      src={prestation.images[0].url}
                      alt={`Image de ${prestation.name}`}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 50vw"
                      priority
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PrestationList;
"use client";

import { Prestation } from "@/lib/types";
import Image from "next/image";

interface PrestationListProps {
  prestations: Prestation[];
}

const PrestationList: React.FC<PrestationListProps> = ({ prestations }) => {
  if (!prestations.length) {
    return <div className="text-white text-center">Aucune image de tatouage trouvée.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-purpleclair opacity-80">
      {prestations.map((prestation) => (
        <div key={prestation.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
          {prestation.images.length > 0 && (
            <div className="relative w-full h-64">
              <Image
                src={prestation.images[0].url}
                alt={`Tatouage - ${prestation.name}`}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <h2 className="text-lg font-semibold text-center">{prestation.name}</h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrestationList;

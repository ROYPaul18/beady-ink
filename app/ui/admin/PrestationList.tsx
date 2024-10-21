"use client";

import { useState, useEffect } from "react";
import { Prestation, Image as PrismaImage } from "@prisma/client";
import DeletePrestationButton from "@/app/ui/admin/DeletePrestationButton";
import Image from "next/image";

// Étend le type Prestation pour inclure les images associées
interface PrestationWithImages extends Prestation {
  images: PrismaImage[];
}

interface PrestationListProps {
  prestations: PrestationWithImages[];
}

const PrestationList: React.FC<PrestationListProps> = ({ prestations }) => {
  const [currentPrestations, setCurrentPrestations] = useState<PrestationWithImages[]>([]);

  useEffect(() => {
    setCurrentPrestations(prestations);
  }, [prestations]);

  const handleDelete = (id: number) => {
    setCurrentPrestations((prev) => prev.filter((prestation) => prestation.id !== id));
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      {currentPrestations.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {currentPrestations.map((prestation) => (
            <li key={prestation.id} className="py-4 flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium text-gray-800">{prestation.name}</p>
                  <p className="text-sm text-gray-500">
                    Prix: {prestation.price} € | Durée: {prestation.duration} minutes
                  </p>
                </div>
                <DeletePrestationButton id={prestation.id} onDelete={handleDelete} />
              </div>
              {/* Affichage des images associées */}
              <div className="flex space-x-2 mt-2">
                {prestation.images.length > 0 ? (
                  prestation.images.map((image) => (
                    <Image
                      key={image.id}
                      src={image.url}
                      alt={`Image de ${prestation.name}`}
                      width={100}
                      height={100}
                      className="object-cover rounded-md"
                    />
                  ))
                ) : (
                  <p className="text-gray-400">Pas d'images disponibles</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 text-center">
          Aucune prestation trouvée pour le service sélectionné.
        </p>
      )}
    </div>
  );
};

export default PrestationList;

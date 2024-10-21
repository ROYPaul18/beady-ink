"use client";

import { useState, useEffect } from "react";
import { Prestation } from "@prisma/client";
import DeletePrestationButton from "@/app/ui/admin/DeletePrestationButton";

interface PrestationListProps {
  prestations: Prestation[];
}

const PrestationList: React.FC<PrestationListProps> = ({ prestations }) => {
  const [currentPrestations, setCurrentPrestations] = useState<Prestation[]>([]);

  useEffect(() => {
    // Met à jour les prestations quand elles changent
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
            <li key={prestation.id} className="py-4 flex justify-between items-center">
              <div>
                <p className="text-lg font-medium text-gray-800">{prestation.name}</p>
                <p className="text-sm text-gray-500">
                  Prix: {prestation.price} € | Durée: {prestation.duration} minutes
                </p>
              </div>
              <DeletePrestationButton id={prestation.id} onDelete={handleDelete} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 text-center">
          Aucune prestation trouvée pour le service d'onglerie.
        </p>
      )}
    </div>
  );
};

export default PrestationList;

"use client";

import { useState } from "react";
import DeletePrestationButton from "@/app/ui/admin/DeletePrestationButton"; // Assurez-vous que ce chemin est correct
import { Prestation } from "@prisma/client";

interface AdminClientProps {
  prestations: Prestation[];
}

const AdminClient: React.FC<AdminClientProps> = ({ prestations }) => {
  const [prestationsList, setPrestationsList] = useState<Prestation[]>(prestations);

  const handleDelete = (id: number) => {
    setPrestationsList((prev) => prev.filter((prestation) => prestation.id !== id));
  };

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
        Liste des prestations pour l'onglerie
      </h2>

      {prestationsList.length > 0 ? (
        <div className="bg-white shadow rounded-lg p-4">
          <ul className="divide-y divide-gray-200">
            {prestationsList.map((prestation) => (
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
        </div>
      ) : (
        <p className="text-gray-600 text-center">Aucune prestation trouvée pour le service d'onglerie.</p>
      )}
    </div>
  );
};

export default AdminClient;

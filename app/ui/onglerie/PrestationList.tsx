"use client"; // Indique que c'est un Client Component

import { useRouter } from "next/navigation"; // Importer depuis next/navigation
import { Prestation } from "@/lib/types";
import Image from "next/image"; // Importer le composant Image

interface PrestationListProps {
  prestations: Prestation[];
}

const PrestationList: React.FC<PrestationListProps> = ({ prestations }) => {
  const router = useRouter();

  const handleReservationClick = (id: number) => {
    // Rediriger vers la route de réservation avec l'ID de la prestation
    router.push(`/reservation/${id}`);
  };

  if (!prestations.length) {
    return <div>Aucune prestation trouvée</div>;
  }

  return (
    <div>
      {prestations.map((prestation) => (
        <div key={prestation.id} className="mb-6 p-4 border rounded-lg">
          <h3 className="text-2xl font-bold">{prestation.name}</h3>
          <p>Prix : {prestation.price} €</p>
          <p>Durée : {prestation.duration} minutes</p>
          <p>Description : {prestation.description}</p>
          <div className="mt-4 flex space-x-2">
            {prestation.images.map((image, index) => (
              <Image
                key={index}
                src={image.url}
                alt={`Image ${index + 1}`}
                width={100}
                height={100}
                className="object-cover rounded-md"
              />
            ))}
          </div>
          {/* Bouton pour réserver */}
          <button
            onClick={() => handleReservationClick(prestation.id)}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
          >
            Réserver cette prestation
          </button>
        </div>
      ))}
    </div>
  );
};

export default PrestationList;

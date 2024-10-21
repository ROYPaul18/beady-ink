"use client"; // Indique que c'est un Client Component

import { useRouter } from "next/navigation"; // Importer depuis next/navigation
import { useState } from "react";
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
    return <div className="text-center text-gray-500">Aucune prestation trouvée</div>;
  }

  return (
    <div className="space-y-6">
      {prestations.map((prestation) => (
        <div key={prestation.id} className="flex bg-white shadow-md rounded-lg overflow-hidden">
          <div className="w-1/3">
            <ImageSlider images={prestation.images} />
          </div>
          <div className="w-2/3 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">{prestation.name}</h3>
              <p className="text-gray-700 mb-1">Prix : {prestation.price} €</p>
              <p className="text-gray-700 mb-1">Durée : {prestation.duration} minutes</p>
              <p className="text-gray-700 mb-4">{prestation.description}</p>
            </div>
            <button
              onClick={() => handleReservationClick(prestation.id)}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-200"
            >
              Réserver cette prestation
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Composant pour le slider d'images
const ImageSlider: React.FC<{ images: { url: string }[] }> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  if (images.length === 0) {
    return <div className="h-full bg-gray-100 flex items-center justify-center text-gray-400">Pas d'images disponibles</div>;
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={images[currentIndex].url}
        alt={`Image ${currentIndex + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
          >
            ◀
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
          >
            ▶
          </button>
        </>
      )}
    </div>
  );
};

export default PrestationList;

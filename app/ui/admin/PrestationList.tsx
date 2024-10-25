// PrestationList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Prestation, Image as PrismaImage, ServiceType } from '@prisma/client';
import DeletePrestationButton from '@/app/ui/admin/DeletePrestationButton';
import Image from 'next/image';

// Étend le type Prestation pour inclure les images associées et le service
interface PrestationWithImages extends Prestation {
  images: PrismaImage[];
  service: {
    type: ServiceType;
  };
}

interface PrestationListProps {
  prestations: PrestationWithImages[];
  serviceType: ServiceType;
}

const PrestationList: React.FC<PrestationListProps> = ({ prestations, serviceType }) => {
  const [currentPrestations, setCurrentPrestations] = useState<PrestationWithImages[]>([]);

  useEffect(() => {
    // Filtrer les prestations en fonction du serviceType
    const filteredPrestations = prestations.filter(
      (prestation) => prestation.service.type === serviceType
    );
    setCurrentPrestations(filteredPrestations);
  }, [prestations, serviceType]);

  const handleDelete = (id: number) => {
    setCurrentPrestations((prev) => prev.filter((prestation) => prestation.id !== id));
  };

  const renderPrestationDetails = (prestation: PrestationWithImages) => {
    switch (serviceType) {
      case ServiceType.TATOUAGE:
        // Afficher uniquement les images pour les tatouages
        return (
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
        );

      case ServiceType.FLASH_TATTOO:
        // Afficher les images et le prix pour les flash tattoos
        return (
          <>
            <p className="text-sm text-gray-500">Prix: {prestation.price} €</p>
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
          </>
        );

      case ServiceType.ONGLERIE:
        // Afficher toutes les informations pour les prestations d'onglerie
        return (
          <>
            <p className="text-sm text-gray-500">
              Prix: {prestation.price} € | Durée: {prestation.duration} minutes
            </p>
            <p className="text-sm text-gray-500">{prestation.description}</p>
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
          </>
        );

      default:
        return null;
    }
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
                  {renderPrestationDetails(prestation)}
                </div>
                <DeletePrestationButton id={prestation.id} onDelete={handleDelete} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-grayx&-600 text-center">
          Aucune prestation trouvée pour le service sélectionné.
        </p>
      )}
    </div>
  );
};

export default PrestationList;

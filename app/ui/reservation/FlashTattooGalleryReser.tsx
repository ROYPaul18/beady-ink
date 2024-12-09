'use client';

import { useState } from 'react';
import { Prestation } from '@/lib/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface FlashTattooGalleryProps {
  prestations: Prestation[];
}

interface FlashTattooStorageData {
  flashTattooId: number;
  name: string;
  price: number;
  images: { url: string }[];
}

const FlashTattooGallery: React.FC<FlashTattooGalleryProps> = ({ prestations }) => {
  const [selectedTattoo, setSelectedTattoo] = useState<Prestation | null>(null);
  const router = useRouter();

  const handleSelect = (prestation: Prestation) => {
    const isAlreadySelected = selectedTattoo?.id === prestation.id;
  
    const updatedSelection = isAlreadySelected ? null : prestation;
  
    setSelectedTattoo(updatedSelection);
  
    try {
      const storageData = updatedSelection
        ? {
            flashTattooId: updatedSelection.id,
            name: updatedSelection.name,
            price: updatedSelection.price,
            imageUrl: updatedSelection.images && updatedSelection.images.length > 0
              ? updatedSelection.images[0].url
              : null, // Récupère la première URL d'image
          }
        : null;
  
      if (
        storageData &&
        typeof storageData.flashTattooId === 'number' &&
        typeof storageData.name === 'string' &&
        typeof storageData.price === 'number' &&
        typeof storageData.imageUrl === 'string'
      ) {
        localStorage.setItem('flashTattooData', JSON.stringify(storageData));
      } else {
        localStorage.removeItem('flashTattooData'); // Supprime si invalide
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données:", error);
    }
  };
  
  

  const totalPrice = selectedTattoo ? selectedTattoo.price : 0;

  if (!prestations || prestations.length === 0) {
    return <div className="text-center text-white">Aucun flash tattoo disponible.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Panneau de sélection */}
      <div className="w-full max-w-lg bg-black bg-opacity-80 p-3 sm:p-4 flex flex-col mx-auto sm:mx-0">
        <h2 className="text-white text-sm sm:text-base font-bold mb-3">Votre sélection</h2>

        {selectedTattoo === null ? (
          <p className="text-white/60 text-xs sm:text-sm">Aucun flash tattoo sélectionné</p>
        ) : (
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-white text-xs sm:text-sm font-semibold">{selectedTattoo.name}</h3>
              <button
                onClick={() => handleSelect(selectedTattoo)}
                className="text-white hover:text-red-400 text-xs sm:text-sm"
              >
                ✕
              </button>
            </div>
            <div className="relative w-full h-24 sm:h-32 mb-2">
              <Image
                src={selectedTattoo.images[0]?.url || '/placeholder.png'}
                alt={selectedTattoo.name}
                className="rounded object-contain"
                fill
              />
            </div>
            <p className="text-xs sm:text-sm text-white/80">{selectedTattoo.price} €</p>
          </div>
        )}

        <div className="mt-3">
          <div className="flex justify-between text-white mb-3">
            <span className="text-xs sm:text-sm">Total</span>
            <span className="text-xs sm:text-sm font-bold">{totalPrice} €</span>
          </div>
          <button
            onClick={() => router.push('/reservation/flashtattoo/questionnaire-sante')}
            className={`w-full bg-green text-white px-3 py-2 rounded-lg hover:bg-green-600 transition ${
              !selectedTattoo ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!selectedTattoo}
          >
            Continuer
          </button>
        </div>
      </div>

      {/* Galerie de tatouages */}
      <div className="flex-1">
        <div className="p-4 sm:p-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white bg-green px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition mb-6"
          >
            <span className="text-sm sm:text-base">&larr;</span>
            <span className="text-xs sm:text-sm">Retour</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {prestations.map((prestation) => (
              <div
                key={prestation.id}
                className={`shadow-md overflow-hidden cursor-pointer transform transition hover:scale-105 ${
                  selectedTattoo?.id === prestation.id ? 'ring-4 ring-green' : ''
                }`}
                onClick={() => handleSelect(prestation)}
              >
                <div className="relative w-full h-48 sm:h-56 md:h-64">
                  <Image
                    src={prestation.images[0]?.url || '/placeholder.png'}
                    alt={prestation.name}
                    className="rounded object-cover"
                    layout="fill"
                  />
                </div>
                <div className="p-3 text-center bg-black bg-opacity-60">
                  <h3 className="text-sm font-bold mb-1 text-white">{prestation.name}</h3>
                  <p className="text-xs font-semibold text-white">À partir de {prestation.price} €</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashTattooGallery;
